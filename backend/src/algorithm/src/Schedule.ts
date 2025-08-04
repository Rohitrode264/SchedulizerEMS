import { SchedulizerMetaData } from './Schedulizer';
import { _Class, Room } from './types';

export class Schedule {

    data: SchedulizerMetaData;
    classes: Array<_Class>;
    rooms: Array<Room>;
    facultyNonAvailability: Map<string, Set<number>>;
    studentGroupNonAvailability: Map<string, Set<number>>;
    schedule: Map<number, _Class>;
    fitness: number;
    classLookup: Map<string, _Class>;

    constructor(metaData: SchedulizerMetaData, classes: Array<_Class>, rooms: Array<Room>, facultyNonAvailability: Map<string, Set<number>>, studentGroupNonAvailability: Map<string, Set<number>>) {
        this.data = metaData;
        this.classes = classes;
        this.rooms = rooms;
        this.facultyNonAvailability = facultyNonAvailability;
        this.studentGroupNonAvailability = studentGroupNonAvailability;
        this.schedule = new Map<number, _Class>();
        this.fitness = 0;
        this.classLookup = new Map<string, _Class>();

        classes.forEach((c: _Class) => {
            this.classLookup.set(c.id, c);
        });
    }

    calculateFitness() {
        this.fitness = 0;
    }

    studentGroupFormat(): Map<string, Array<any>> {
        const studentGroupMap = new Map<string, Array<any>>();

        this.classes.forEach((c: _Class) => {
            // Initialize array for each student group if not exists
            if (!studentGroupMap.has(c.studentGroupId)) {
                studentGroupMap.set(c.studentGroupId, []);
            }

            // Get all slots where this class is scheduled
            for (let day = 0; day < this.data.daysPerWeek; day++) {
                for (let slot = 0; slot < this.data.slotsPerDay; slot++) {
                    const index = day * this.data.slotsPerDay + slot;
                    const classInSlot = this.schedule.get(index);
                    if (classInSlot?.id === c.id) {
                        studentGroupMap.get(c.studentGroupId)!.push({
                            day,
                            startSlot: slot,
                            room: this.rooms.findIndex(r => r.id === c.roomId),
                            roomId: c.roomId,
                            id: c.id,
                            facultyId: c.facultyId,
                            studentGroupId: c.studentGroupId,
                            courseId: c.courseId,
                            courseType: c.courseType,
                            scheduleId: c.scheduleId,
                            electiveBasketId: c.electiveBasketId,
                            batches: c.batches,
                            concurrentClasses: c.concurrentClasses,
                            concurrentByClasses: c.concurrentByClasses.map(id => ({ id })),
                            course: {
                                credits: c.courseCredits,
                                courseType: c.courseType,
                                name: c.courseName
                            },
                            faculty: {
                                name: c.facultyName
                            },
                            StudentGroup: {
                                name: c.studentGroupName
                            },
                            courseCredits: c.courseCredits,
                            headCount: c.headCount,
                            duration: c.duration,
                            classesPerWeek: c.classesPerWeek,
                            facultyName: c.facultyName,
                            courseName: c.courseName,
                            studentGroupName: c.studentGroupName
                        });
                    }
                }
            }
        });

        return studentGroupMap;
    }

    facultyFormat(): Map<string, Array<any>> {
        const facultyMap = new Map<string, Array<any>>();
        
        this.classes.forEach((c: _Class) => {
            if (!facultyMap.has(c.facultyId)) {
                facultyMap.set(c.facultyId, []);
            }

            for (let day = 0; day < this.data.daysPerWeek; day++) {
                for (let slot = 0; slot < this.data.slotsPerDay; slot++) {
                    const index = day * this.data.slotsPerDay + slot;
                    const classInSlot = this.schedule.get(index);
                    if (classInSlot?.id === c.id) {
                        facultyMap.get(c.facultyId)!.push({
                            day,
                            startSlot: slot,
                            room: this.rooms.findIndex(r => r.id === c.roomId),
                            roomId: c.roomId,
                            id: c.id,
                            facultyId: c.facultyId,
                            studentGroupId: c.studentGroupId,
                            courseId: c.courseId,
                            courseType: c.courseType,
                            scheduleId: c.scheduleId,
                            electiveBasketId: c.electiveBasketId,
                            batches: c.batches,
                            concurrentClasses: c.concurrentClasses,
                            concurrentByClasses: c.concurrentByClasses.map(id => ({ id })),
                            course: {
                                credits: c.courseCredits,
                                courseType: c.courseType,
                                name: c.courseName
                            },
                            faculty: {
                                name: c.facultyName
                            },
                            StudentGroup: {
                                name: c.studentGroupName
                            },
                            courseCredits: c.courseCredits,
                            headCount: c.headCount,
                            duration: c.duration,
                            classesPerWeek: c.classesPerWeek,
                            facultyName: c.facultyName,
                            courseName: c.courseName,
                            studentGroupName: c.studentGroupName
                        });
                    }
                }
            }
        });

        return facultyMap;
    }
}

