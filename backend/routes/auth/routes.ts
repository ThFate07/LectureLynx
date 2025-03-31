import { config } from "dotenv";
config();

import express, {Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import z, { string } from 'zod';
import {signupSchema, loginSchema} from '../../schema/typeSchemas'
import { authenticateToken } from "../../middleware/middleware";
import prisma from "../../db/db";
import { stat } from "fs";


const secretKey = process.env.SECRET_KEY || '';
const router = express.Router();
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password, phoneNumber, department } = signupSchema.parse(req.body);

    const isExist = await prisma.teachers.findUnique({ 
      where: { 
        email: email
      }
    })
    
    if (isExist) { 
      return res.status(400).json({error: "User already exists"})
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newTeacher = await prisma.teachers.create({
      data: { 
        name,
        email,
        password: hashedPassword,
        department,
        phone: phoneNumber
      }
    });

    const token = jwt.sign({id: newTeacher.teacher_id}, secretKey, {expiresIn: '1d'})

    res.cookie('token', token, {
      httpOnly: true, 
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({message: "signup successful!!"});
    
  } catch (error) {

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors.map(e => e.message) });
    }

    console.error("Error during signup:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const teacher = await prisma.teachers.findUnique({ 
      where: { 
        email: email
      }
    })
    
    if (!teacher) { 
      return res.status(400).json({error: "Email not found"})
    }

    const isCorrect = await bcrypt.compare(password, teacher.password)

    if (!isCorrect) { 
      return res.status(400).json({error: "invalid password!"});
    } 

    const token = jwt.sign({id: teacher.teacher_id}, secretKey, {expiresIn: '1d'});
    
    res.cookie('token', token, {
      httpOnly: true, 
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({message: "login successfull"})

 
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors.map(e => e.message) });
    }
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/teachers/:teacher_id",authenticateToken,  async (req, res) => { 
  try { 

    const reqId = Number(req.params.teacher_id);
  
    console.log(reqId);
    
    const teacherDetails = await prisma.teachers.findUnique({
      where: { 
        teacher_id: reqId
      },
      select: { 
        teacher_id: true,
        name: true,
        email: true,
        department: true,
        phone: true,
        password: false
      }
    })

    if (!teacherDetails) { 
      return res.status(400).json({error: "no teacher with the id found"});
    }

    return res.status(200).json({message: "fetch successfull", data:teacherDetails })
  } catch (error) { 
    console.log(error);
    return res.status(400).json({error: `got error: ${error}`})
  }

  
})

router.post('/verifyToken', (req, res ) => { 

  const token = req.cookies?.token
  

  if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const secretKey = process.env.SECRET_KEY || ''; // Use your secret key from environment variables
    const decoded = jwt.verify(token, secretKey); // Verify the token
    
    return res.status(200).json({message: "verified"});
    
  } catch (err) {
      return res.status(401).json({ error: 'Invalid token.' });
  }

});

export default router