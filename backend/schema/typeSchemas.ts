import z from 'zod';

export const signupSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
    department: z.string().min(1, 'Department is required'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
})

export const rescheduleInputSchema = z.object({ 
    timetable_id: z.number().int().positive({ message: "timetable_id must be a positive integer." }),
    teacher_id: z.number().int().positive({ message: "teacher_id must be a positive integer." }),
    requested_time: z.string().refine((date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
    }, { message: "requested_time must be a valid future date." }),
    reason: z.string().min(1, { message: "Reason cannot be empty." }).optional()
})

export const claimSchema = z.object({
    request_id: z.number().int().positive(),
    teacher_id: z.number().int().positive(),
});

export const cancelSchema = z.object({
    request_id: z.number().int().positive(),
    teacher_id: z.number().int().positive()
});

export const historySchema = z.object({
    teacher_id: z.number().int().positive({ message: "teacher_id must be a positive integer." }),
});