import express from 'express';
import { authenticateToken } from '../../middleware/middleware';
import prisma from '../../db/db';
import { cancelSchema, claimSchema, historySchema, rescheduleInputSchema } from '../../schema/typeSchemas'
import Zod from 'zod';


const router = express.Router();


router.post('/reschedule', authenticateToken, async (req, res) => { 
    try { 
        const {timetable_id, teacher_id, requested_time, reason} = rescheduleInputSchema.parse(req.body);
        
        const slot = await prisma.timetable.findUnique({ 
            where: { 
                timetable_id
            }
        })

        if (!slot || slot.teacher_id !== teacher_id) { 
            return res.status(400).json({error: "Invalid slot or Authorized"})
        }


        const existingRequest  = await prisma.lecturereschedulerequests.findFirst({ 
            where: { 
               timetable_id: timetable_id
            }
        })

        if (existingRequest) {
            return res.status(400).json({error: "A reschedule request for this lecture is already pending." });
        };

        const rescheduleReq = await prisma.lecturereschedulerequests.create({ 
            data: { 
                timetable_id: Number(timetable_id),
                original_teacher_id: Number(teacher_id),
                requested_time: new Date(requested_time),
                reason,
                status: "Pending"
            }
        })

        return res.status(200).json({ success: true, request_id: rescheduleReq.request_id });

    } catch (error) { 
        if (error instanceof Zod.ZodError) {
            return res.status(400).json({ error: error.errors.map(e => e.message) })
        }

        return res.status(500).json({ error: "Internal server error." });
    }



})


router.get("/reschedule-requests", authenticateToken, async (req, res ) => { 
    try { 
        const rescheduleReqs = await prisma.lecturereschedulerequests.findMany();

        return res.status(200).json({sucess: true, requests: rescheduleReqs})
    }
    catch (error) { 
        return res.status(400).json({error: "internal server error"})
    }
})

router.post("/claim-reschedule", authenticateToken, async (req, res) => { 
    try {
        const { request_id, teacher_id } = claimSchema.parse(req.body);


        const existingRequest = await prisma.lecturereschedulerequests.findUnique({
            where: { request_id },
        });

        if (!existingRequest) {
            return res.status(404).json({ success: false, message: "Request not found." });
        }

        if (existingRequest.status !== "Pending") {
            return res.status(400).json({ success: false, message: "This lecture has already been claimed or cancelled." });
        }

        await prisma.lecturereschedulerequests.update({
            where: { request_id },
            data: {
                claimed_by_teacher_id: teacher_id,
                status: "Claimed",
            },
        });

        return res.status(200).json({ success: true, message: "Lecture claimed!" });

    } catch (error) {
        return res.status(400).json({ error: error});
    }
})

router.post("/cancel-reschedule", authenticateToken, async (req, res) => { 
    try {
        // Validate Input
        const { request_id, teacher_id } = cancelSchema.parse(req.body);

        const existingRequest = await prisma.lecturereschedulerequests.findUnique({
            where: { request_id },
        });

        if (!existingRequest) {
            return res.status(404).json({ success: false, message: "Request not found." });
        }

        if (existingRequest.status !== "Pending") {
            return res.status(400).json({ success: false, message: "This request has already been processed and cannot be canceled." });
        }

        if (existingRequest.original_teacher_id !== teacher_id) {
            return res.status(403).json({ success: false, message: "You are not authorized to cancel this request." });
        }


        await prisma.lecturereschedulerequests.delete({
            where: { 
                request_id
            }
        })

        return res.status(200).json({ success: true, message: "Request cancelled." });

    } catch (error) {
        return res.status(400).json({ error });
    }
})

router.get('/reschedule-history/:teacher_id', async (req, res) => {
    try {
        // 🔍 Validate Input
        const { teacher_id } = historySchema.parse({ teacher_id: Number(req.params.teacher_id) });

        // 🔄 Fetch history where the teacher was involved (either as the original or claimed teacher)
        const history = await prisma.lecturereschedulerequests.findMany({
            where: {
                OR: [
                    { original_teacher_id: teacher_id }, // Lectures this teacher requested for reschedule
                    { claimed_by_teacher_id: teacher_id }, // Lectures this teacher claimed
                ],
            },
            select: {
                request_id: true,
                timetable_id: true,
                original_teacher_id: true,
                claimed_by_teacher_id: true,
                status: true,
            },
            orderBy: {
                requested_time: "desc", // Sort by most recent first
            },
        });

        return res.status(200).json({ success: true, history });

    } catch (error) {
        return res.status(400).json({error });
    }
})
export default router