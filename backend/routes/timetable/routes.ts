import express  from "express";
import { authenticateToken } from "../../middleware/middleware";
import prisma from "../../db/db";

const router = express.Router();

router.get("/timetable/all", authenticateToken, async (req, res) => { 
    try { 
        const timetable = await prisma.timetable.findMany();
        if (!timetable) { 
            return res.status(400).json({error: "Error fetching the time ta ble"})
        }

        return res.status(200).json({message: "fetched successfully!", timetable});

    } catch (error) { 
        console.log(error);
        return res.status(400).json({error: "error fetching timetable"})
    }
})


router.get('/timetable/teacher/:teacher_id',authenticateToken, async (req, res) => { 
    try { 

        const teacherId = Number(req.params.teacher_id) 
        
        const fetchedTimetable = await prisma.teachers.findUnique({
            where: { 
                teacher_id: teacherId
            },
            select: { 
                timetable: true
            }
        })

        if (!fetchedTimetable) { 
            return res.status(400).json({error: "Teacher with the given id not found."})
        } 

        return res.status(200).json({message: "Timetable fetched successfully!", timetable: fetchedTimetable})
    } catch ( error ) { 
        console.log(error);
        return res.status(400).json({error: "error fetching teacher id "})
    }
});


export default router;