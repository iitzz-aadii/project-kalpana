// src/engine.ts

import { 
  ScheduledClass, 
  Subject, 
  Faculty, 
  Classroom, 
  TimeSlot,
  TimetableInput
} from './types';


// A "chromosome" in our genetic algorithm is a complete timetable schedule
type Timetable = ScheduledClass[];

// Utility: pick a random element from a non-empty array
const getRandom = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

/**
 * Creates a simple random timetable.
 */
const createRandomTimetable = (input: TimetableInput): Timetable => {
  const timetable: Timetable = [];
  for (const subject of input.subjects) {
    for (let hourIndex = 0; hourIndex < subject.hoursPerWeek; hourIndex++) {
      const qualifiedFaculty = input.faculty.filter(f => f.canTeach.includes(subject.id));
      if (qualifiedFaculty.length === 0) continue;
      
      const faculty = getRandom(qualifiedFaculty);
      const classroom = getRandom(input.classrooms);
      const timeSlot = getRandom(input.timeSlots);

      timetable.push({
        subjectId: subject.id,
        facultyId: faculty.id,
        classroomId: classroom.id,
        timeSlotId: timeSlot.id,
      });
    }
  }
  return timetable;
};

/**
 * The "Fitness Function". It scores a single timetable based on constraints.
 */
const calculateFitness = (timetable: Timetable): number => {
  let score = 0;
  const facultyTimeSlots = new Set<string>();
  const classroomTimeSlots = new Set<string>();
  
  for (const scheduledClass of timetable) {
    const facultySlotKey = `${scheduledClass.facultyId}-${scheduledClass.timeSlotId}`;
    const classroomSlotKey = `${scheduledClass.classroomId}-${scheduledClass.timeSlotId}`;
    
    if (facultyTimeSlots.has(facultySlotKey)) score -= 100;
    else facultyTimeSlots.add(facultySlotKey);
    
    if (classroomTimeSlots.has(classroomSlotKey)) score -= 100;
    else classroomTimeSlots.add(classroomSlotKey);
  }
  
  return score;
};

/**
 * "Breeds" two parent timetables to create a child.
 */
const crossover = (parentA: Timetable, parentB: Timetable): Timetable => {
  const crossoverPoint = Math.floor(Math.random() * parentA.length);
  const child = parentA.slice(0, crossoverPoint).concat(parentB.slice(crossoverPoint));
  return child; // <-- THIS LINE WAS MISSING
};

/**
 * The main function that runs the genetic algorithm.
 */
export const generateTimetable = (input: TimetableInput): Timetable => {
  console.log("Starting timetable generation...");

  const POPULATION_SIZE = 100;
  const NUM_GENERATIONS = 50;
  const ELITISM_RATE = 0.2; // Keep the top 20% of parents

  // --- Step 1: Initialize Population ---
  let population = Array(POPULATION_SIZE).fill(null).map(() => createRandomTimetable(input));
  let populationWithFitness = population.map(timetable => ({
    timetable,
    fitness: calculateFitness(timetable)
  }));
  populationWithFitness.sort((a, b) => b.fitness - a.fitness);

  // --- Step 2: Evolution Loop ---
  for (let generation = 0; generation < NUM_GENERATIONS; generation++) {
    const eliteSize = Math.floor(POPULATION_SIZE * ELITISM_RATE);
    const elites = populationWithFitness.slice(0, eliteSize);

    const nextGeneration = elites.map(el => el.timetable); // Elites pass on directly

    while (nextGeneration.length < POPULATION_SIZE) {
      const parentA = getRandom(elites).timetable;
      const parentB = getRandom(elites).timetable;
      const child = crossover(parentA, parentB);
      // TODO: Add a mutation step here for more diversity
      nextGeneration.push(child);
    }
    
    population = nextGeneration;
    populationWithFitness = population.map(timetable => ({
      timetable,
      fitness: calculateFitness(timetable)
    }));
    populationWithFitness.sort((a, b) => b.fitness - a.fitness);
    
    console.log(`Generation ${generation + 1}: Best Fitness = ${populationWithFitness[0].fitness}`);
  }

  // --- Step 3: Return the Best Timetable ---
  console.log("Timetable generation finished.");
  return populationWithFitness[0].timetable; 
};