//import data from './data.json' 
import { Schedule } from './Schedule';
import { Schedulizer, SchedulizerMetaData } from './Schedulizer';
import { _Class, Room } from './types';
import { _classesGenerator, facultyNonAvailabilityGenerator, roomGenerator, studentGroupNonAvailabilityGenerator } from './utils';

export default function run(data: any) {
    const metaData: SchedulizerMetaData = {
        daysPerWeek: data.days,
        slotsPerDay: data.slots,
        maxGeneration: 1000,
        mutationRate: 0.1,
        populationSize: 100
    }

    const rooms: Array<Room> = roomGenerator(data);
    const classes: Array<_Class> = _classesGenerator(data);
    const facultyNonAvailability = facultyNonAvailabilityGenerator(data);
    const studentGroupNonAvailability = studentGroupNonAvailabilityGenerator(data);

    const schedulizer = new Schedulizer(metaData, classes, rooms, facultyNonAvailability, studentGroupNonAvailability);
    schedulizer.initializePopulation();

    for(let i = 0; i < metaData.maxGeneration; i++) {
        schedulizer.spawnNextGeneration();
    }

    const response = {
        days: data.days,
        slots: data.slots,
        studentsGroupData: deepMapToObject(schedulizer.fittestSchedule.studentGroupFormat()),
        facultyData: deepMapToObject(schedulizer.fittestSchedule.facultyFormat())
    }

    return response;
}

function deepMapToObject(map: any): any {
    if (map instanceof Map) {
      const obj: Record<string, any> = {};
      for (const [key, value] of map.entries()) {
        obj[key] = deepMapToObject(value);
      }
      return obj;
    } else if (Array.isArray(map)) {
      return map.map(deepMapToObject);
    } else {
      return map;
    }
  }