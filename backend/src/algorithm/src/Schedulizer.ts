import { Schedule } from "./Schedule";
import { _Class, Room } from "./types";

export interface SchedulizerMetaData {
    daysPerWeek: number,
    slotsPerDay: number,
    maxGeneration: number,
    mutationRate: number,
    populationSize: number
}

export class Schedulizer {

    data: SchedulizerMetaData;
    classes: Array<_Class>;
    rooms: Array<Room>;
    facultyNonAvailability: Map<string, Set<number>>;
    studentGroupNonAvailability: Map<string, Set<number>>;
    population: Array<Schedule>;
    fittestSchedule: Schedule;

    constructor(metaData: SchedulizerMetaData, classes: Array<_Class>, rooms: Array<Room>, facultyNonAvailability: Map<string, Set<number>>, studentGroupNonAvailability: Map<string, Set<number>>) {
        this.data = metaData;
        this.classes = classes;
        this.rooms = rooms
        this.facultyNonAvailability = facultyNonAvailability;
        this.studentGroupNonAvailability = studentGroupNonAvailability;
        this.population = new Array<Schedule>();
        this.fittestSchedule = new Schedule(metaData, classes, rooms, facultyNonAvailability, studentGroupNonAvailability);
    }

    initializePopulation() {
        for(let i=0; i<this.data.populationSize; i++) {
            this.population.push(new Schedule(this.data, this.classes, this.rooms, this.facultyNonAvailability, this.studentGroupNonAvailability));
        }
    }

    calculateFitness() {
        this.population.forEach(schedule => {
            schedule.calculateFitness();
        });
    }

    selection() {
        this.population.sort((a, b) => b.fitness - a.fitness);
        this.fittestSchedule = this.population[0];
    }

    crossover() {
        const parent1 = this.population[0];
        const parent2 = this.population[1];

        const child1 = new Schedule(this.data, this.classes, this.rooms, this.facultyNonAvailability, this.studentGroupNonAvailability);
        const child2 = new Schedule(this.data, this.classes, this.rooms, this.facultyNonAvailability, this.studentGroupNonAvailability);

        for(let i=0; i<this.classes.length; i++) {
            if(Math.random() > 0.5) {
                child1.schedule.set(i, parent1.schedule.get(i)!);
                child2.schedule.set(i, parent2.schedule.get(i)!);
            } else {
                child1.schedule.set(i, parent2.schedule.get(i)!);
                child2.schedule.set(i, parent1.schedule.get(i)!);
            }
        }

        this.population.push(child1);
        this.population.push(child2);
    }

    mutation() {
        this.population.forEach(schedule => {
            for(let i=0; i<this.classes.length; i++) {
                if(Math.random() < this.data.mutationRate) {
                    schedule.schedule.set(i, this.classes[Math.floor(Math.random() * this.classes.length)]);
                }
            }
        });
    }

    spawnNextGeneration() {
        this.calculateFitness();
        this.selection();
        this.crossover();
        this.mutation();
        this.population = this.population.slice(0, this.data.populationSize);
    }
}


