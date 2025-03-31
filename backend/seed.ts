import { PrismaClient, timetable_day } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash passwords for teachers
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Seed Teachers
  const teachers = await prisma.teachers.createMany({
    data: [
      { name: "Dr. Smith", email: "smith@univ.com", password: hashedPassword, department: "CS", phone: "1234567890" },
      { name: "Prof. Johnson", email: "johnson@univ.com", password: hashedPassword, department: "EE", phone: "1234567891" },
      { name: "Dr. Lee", email: "lee@univ.com", password: hashedPassword, department: "Math", phone: "1234567892" },
      { name: "Dr. Patel", email: "patel@univ.com", password: hashedPassword, department: "CS", phone: "1234567893" },
      { name: "Prof. Davis", email: "davis@univ.com", password: hashedPassword, department: "IT", phone: "1234567894" },
    ],
  });

  // Seed Subjects
  const subjects = await prisma.subjects.createMany({
    data: [
      { name: "Operating Systems", code: "OS101" },
      { name: "Microprocessors", code: "MP102" },
      { name: "Mathematics 4", code: "MATH104" },
      { name: "Database Management Systems", code: "DBMS103" },
      { name: "Python", code: "PY105" },
    ],
  });

  // Seed Classes
  const classes = await prisma.classes.createMany({
    data: [
      { name: "CS-A" },
      { name: "CS-B" },
      { name: "IT-A" },
      { name: "IT-B" },
      { name: "EE-A" },
    ],
  });

  // Create a sample timetable for a month
  const startHour = 9;
  const subjectsList = await prisma.subjects.findMany();
  const teachersList = await prisma.teachers.findMany();
  const classesList = await prisma.classes.findMany();
  
  let timetableEntries = [];
  const daysOfWeek = Object.values(timetable_day);

  for (let day = 0; day < 30; day++) {
    let currentHour = startHour;
    let batch = 1;

    for (const subject of subjectsList) {
      const teacher = teachersList.find(t => t.name.includes(subject.name.split(" ")[0])) || teachersList[0];
      const classData = classesList[batch % classesList.length];
      const startTime = new Date(Date.UTC(2025, 2, day + 1, currentHour, 0, 0)); // March 2025
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + (batch % 2 === 0 ? 2 : 1)); // Labs (2 hours) & Lectures (1 hour)

      timetableEntries.push({
        teacher_id: teacher.teacher_id,
        subject_id: subject.subject_id,
        class_id: classData.class_id,
        day: daysOfWeek[day % 7], // Map day to enum
        start_time: startTime,
        end_time: endTime,
      });
      
      currentHour += (batch % 2 === 0 ? 2 : 1);
      batch++;
    }
  }

  await prisma.timetable.createMany({ data: timetableEntries });

  console.log("Database seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
