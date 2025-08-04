import { PrismaClient, CourseType } from '@prisma/client';
import { Hono } from 'hono';
import run from '../algorithm/src/run';
import { authAdmin } from "../middlewares/authAdmin";

interface ScheduleEntry {
  day: number;
  startSlot: number;
  duration: number;
  facultyName: string;
  courseName: string;
  courseType: CourseType;
}

interface ScheduleResponse {
  days: number;
  slots: number;
  studentGroupId: ScheduleEntry[];
}

// Add this interface for faculty schedule response
interface FacultyScheduleResponse {
  days: number;
  slots: number;
  schedules: {
    day: number;
    startSlot: number;
    duration: number;
    studentGroupName: string;
    courseName: string;
    courseType: CourseType;
  }[];
}

const app = new Hono<{
  Variables: {
    instituteId: String;
    prisma: PrismaClient;
  };
}>();

app.use(authAdmin);

app.get("/schedule/data/:scheduleId", async (c) => {
  const scheduleId = c.req.param("scheduleId");
  const prisma = c.get("prisma");

  try {
    const data = await prisma.schedule.findFirst({
      where: { id: scheduleId },
      select: {
        days: true,
        slots: true,
        rooms: {
          select: {
            code: true,
            isLab: true,
            capacity: true,
            id: true,
          },
        },
        classes: {
          include: {
            batches: { select: { id: true, name: true } },
            concurrentClasses: { select: { id: true } },
            concurrentByClasses: { select: { id: true } },
            course: {
              select: {
                credits: true,
                courseType: true,
                name: true,
              },
            },
            faculty: {
              select: {
                id: true,
                name: true,
              },
            },
            StudentGroup: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        facultyAvailability: {
          select: {
            availability: true,
            facultyId: true,
            scheduleId: true,
          },
        },
        studentGroupAvailability: {
          select: {
            availability: true,
            studentGroupId: true,
            scheduleId: true,
          },
        },
      },
    });

    if (!data) {
      return c.json({ message: "No such Schedule" }, { status: 404 });
    }

  
    if (typeof data.days !== 'number') {
      console.error("Error: data.days is missing or not a number");
      console.log("data.days value:", data.days);
      return c.json({ message: "Invalid schedule data: days" }, { status: 500 });
    }

    if (typeof data.slots !== 'number') {
      console.error("Error: data.slots is missing or not a number");
      console.log("data.slots value:", data.slots);
      return c.json({ message: "Invalid schedule data: slots" }, { status: 500 });
    }

    if (!data.rooms || !Array.isArray(data.rooms)) {
      console.error("Error: data.rooms is missing or not an array");
      console.log("data.rooms value:", data.rooms);
      return c.json({ message: "Invalid schedule data: rooms" }, { status: 500 });
    }

    if (!data.classes || !Array.isArray(data.classes)) {
      console.error("Error: data.classes is missing or not an array");
      console.log("data.classes value:", data.classes);
      return c.json({ message: "Invalid schedule data: classes" }, { status: 500 });
    }

    if (!data.facultyAvailability || !Array.isArray(data.facultyAvailability)) {
      console.error("Error: data.facultyAvailability is missing or not an array");
      console.log("data.facultyAvailability value:", data.facultyAvailability);
      return c.json({ message: "Invalid schedule data: facultyAvailability" }, { status: 500 });
    }

    if (!data.studentGroupAvailability || !Array.isArray(data.studentGroupAvailability)) {
      console.error("Error: data.studentGroupAvailability is missing or not an array");
      console.log("data.studentGroupAvailability value:", data.studentGroupAvailability);
      return c.json({ message: "Invalid schedule data: studentGroupAvailability" }, { status: 500 });
    }

   
    const result = run(data);

    
    await storeScheduleOutput(prisma, scheduleId, result);

    return c.json(result);

  } catch (error) {
    console.error("Error processing schedule:", error);
    return c.json({ 
      message: "Error processing schedule", 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});

async function storeScheduleOutput(
  prisma: PrismaClient,
  scheduleId: string,
  result: any
) {
  return await prisma.$transaction(async (tx) => {
    // Clear existing data
    await tx.scheduleOutput.deleteMany({
      where: { scheduleId }
    });

    // Process each student group's data
    for (const [studentGroupId, entries] of Object.entries(result.studentsGroupData)) {
      const output = await tx.scheduleOutput.create({
        data: {
          scheduleId,
          studentGroupId,
        }
      });

      if (Array.isArray(entries)) {
        // Store class entries
        await tx.scheduleClassEntry.createMany({
          data: entries.map(entry => ({
            scheduleOutputId: output.id,
            day: entry.day,
            startSlot: entry.startSlot,
            duration: entry.duration || 1,
            courseName: entry.course.name,
            courseType: entry.courseType as CourseType
          }))
        });

        
        await tx.scheduleFacultyEntry.createMany({
          data: entries.map(entry => ({
            scheduleOutputId: output.id,
            day: entry.day,
            startSlot: entry.startSlot,
            duration: entry.duration || 1,
            facultyName: entry.faculty.name,
            courseName: entry.course.name,
            courseType: entry.courseType as CourseType
          }))
        });
      }
    }
  });
}


app.get("/studentGroup/:studentGroupId/schedule/:scheduleId", async (c) => {
  const { studentGroupId, scheduleId } = c.req.param();
  const prisma = c.get("prisma");

  try {
    const output = await prisma.scheduleOutput.findFirst({
      where: {
        scheduleId,
        studentGroupId
      },
      include: {
        facultyEntries: true
      }
    });

    if (!output) {
      return c.json({ message: "Schedule not found" }, 404);
    }

    
    const response: ScheduleResponse = {
      days: 5,
      slots: 7,
      studentGroupId: output.facultyEntries.map(entry => ({
        day: entry.day,
        startSlot: entry.startSlot,
        duration: entry.duration,
        facultyName: entry.facultyName,
        courseName: entry.courseName,
        courseType: entry.courseType
      }))
    };

    return c.json(response);

  } catch (error) {
    console.error("Error fetching schedule:", error);
    return c.json({ error: "Failed to fetch schedule" }, 500);
  }
});


app.get("/faculty/:facultyId/schedule/:scheduleId", async (c) => {
  const { facultyId, scheduleId } = c.req.param();
  const prisma = c.get("prisma");

  try {
    
    const outputs = await prisma.scheduleOutput.findMany({
      where: {
        scheduleId
      },
      include: {
        facultyEntries: {
          where: {
            facultyName: {
              equals: (await prisma.faculty.findUnique({
                where: { id: facultyId },
                select: { name: true }
              }))?.name
            }
          },
          select: {
            day: true,
            startSlot: true,
            duration: true,
            courseName: true,
            courseType: true,
            scheduleOutput: {
              include: {
                studentGroup: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

   
    const response: FacultyScheduleResponse = {
      days: 5,
      slots: 7,
      schedules: outputs.flatMap(output => 
        output.facultyEntries.map(entry => ({
          day: entry.day,
          startSlot: entry.startSlot,
          duration: entry.duration,
          studentGroupName: entry.scheduleOutput.studentGroup.name,
          courseName: entry.courseName,
          courseType: entry.courseType
        }))
      )
    };

    return c.json(response);

  } catch (error) {
    console.error("Error fetching faculty schedule:", error);
    return c.json({ error: "Failed to fetch faculty schedule" }, 500);
  }
});

export default app;