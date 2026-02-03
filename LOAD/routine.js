const ROUTINES_KEY = 'routines';
const ACTIVE_ROUTINE_KEY = 'activeRoutineId';
const CURRENT_DAY_INDEX_KEY = 'currentRoutineDayIndex';
const ACTIVE_WORKOUT_SESSION_KEY = 'activeWorkoutSession';
const COMPLETED_WORKOUTS_KEY = 'completedWorkouts';
const STREAK_KEY = 'streak';
const USER_DATA_KEY = 'user';

function getRoutines() {
    const data = localStorage.getItem(ROUTINES_KEY);
    return data ? JSON.parse(data) : [];
}

function saveRoutine(routine) {
    const routines = getRoutines();
    const index = routines.findIndex(r => r.id === routine.id);
    if (index >= 0) {
        routines[index] = routine;
    } else {
        routines.push(routine);
    }
    localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
}

function getActiveRoutineId() {
    return localStorage.getItem(ACTIVE_ROUTINE_KEY);
}

function setActiveRoutineId(id) {
    localStorage.setItem(ACTIVE_ROUTINE_KEY, id);
    localStorage.setItem(CURRENT_DAY_INDEX_KEY, '0');
}

function getCurrentRoutineDayIndex() {
    const index = localStorage.getItem(CURRENT_DAY_INDEX_KEY);
    return index !== null ? parseInt(index) : 0;
}

function setCurrentRoutineDayIndex(index) {
    localStorage.setItem(CURRENT_DAY_INDEX_KEY, index.toString());
}

function advanceRoutineDay() {
    const activeRoutineId = getActiveRoutineId();
    if (!activeRoutineId) {
        return;
    }
    
    const routines = getRoutines();
    const activeRoutine = routines.find(r => r.id === activeRoutineId);
    if (!activeRoutine || !activeRoutine.days || activeRoutine.days.length === 0) {
        return;
    }
    
    const currentIndex = getCurrentRoutineDayIndex();
    const nextIndex = (currentIndex + 1) % activeRoutine.days.length;
    setCurrentRoutineDayIndex(nextIndex);
}

function getCurrentRoutineDay() {
    const activeRoutineId = getActiveRoutineId();
    if (!activeRoutineId) {
        return null;
    }
    
    const routines = getRoutines();
    const activeRoutine = routines.find(r => r.id === activeRoutineId);
    if (!activeRoutine || !activeRoutine.days || activeRoutine.days.length === 0) {
        return null;
    }
    
    const currentIndex = getCurrentRoutineDayIndex();
    return activeRoutine.days[currentIndex];
}

function isRestDay(day) {
    if (!day || !day.label) {
        return false;
    }
    return day.label.toLowerCase().includes('rest');
}

function initializePremadeRoutines() {
    const routines = getRoutines();
    const premadeExists = routines.some(r => r.isPremade);
    
    if (premadeExists) {
        return;
    }
    
    const premadeRoutines = [
        {
            id: 'premade-1',
            name: 'Bro Split',
            days: [
                { dayIndex: 0, label: 'Chest' },
                { dayIndex: 1, label: 'Back' },
                { dayIndex: 2, label: 'Shoulders' },
                { dayIndex: 3, label: 'Arms' },
                { dayIndex: 4, label: 'Legs' },
                { dayIndex: 5, label: 'Rest' }
            ],
            isPremade: true
        },
        {
            id: 'premade-2',
            name: 'Push / Pull / Legs',
            days: [
                { dayIndex: 0, label: 'Push' },
                { dayIndex: 1, label: 'Pull' },
                { dayIndex: 2, label: 'Legs' },
                { dayIndex: 3, label: 'Rest' }
            ],
            isPremade: true
        },
        {
            id: 'premade-3',
            name: 'Upper / Lower',
            days: [
                { dayIndex: 0, label: 'Upper' },
                { dayIndex: 1, label: 'Lower' },
                { dayIndex: 2, label: 'Rest' }
            ],
            isPremade: true
        },
        {
            id: 'premade-4',
            name: 'Full Body',
            days: [
                { dayIndex: 0, label: 'Full Body' },
                { dayIndex: 1, label: 'Rest' }
            ],
            isPremade: true
        }
    ];
    
    premadeRoutines.forEach(routine => {
        routines.push(routine);
    });
    
    localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
}

function getActiveWorkoutSession() {
    const data = localStorage.getItem(ACTIVE_WORKOUT_SESSION_KEY);
    return data ? JSON.parse(data) : null;
}

function startWorkoutSession() {
    const activeRoutineId = getActiveRoutineId();
    if (!activeRoutineId) {
        return false;
    }
    
    const existingSession = getActiveWorkoutSession();
    if (existingSession && existingSession.status === 'active') {
        return false;
    }
    
    const routineDayIndex = getCurrentRoutineDayIndex();
    const session = {
        id: Date.now().toString(),
        routineId: activeRoutineId,
        routineDayIndex: routineDayIndex,
        status: 'active',
        exercises: []
    };
    
    localStorage.setItem(ACTIVE_WORKOUT_SESSION_KEY, JSON.stringify(session));
    return true;
}

function endWorkoutSession() {
    const session = getActiveWorkoutSession();
    if (!session || session.status !== 'active') {
        return false;
    }
    
    if (!session.exercises || session.exercises.length === 0) {
        alert('No exercises logged');
        return false;
    }
    
    let hasAtLeastOneSet = false;
    for (let i = 0; i < session.exercises.length; i++) {
        const exercise = session.exercises[i];
        if (exercise.sets && exercise.sets.length > 0) {
            hasAtLeastOneSet = true;
            break;
        }
    }
    
    if (!hasAtLeastOneSet) {
        alert('No exercises logged');
        return false;
    }
    
    const completedWorkouts = getCompletedWorkouts();
    session.status = 'completed';
    completedWorkouts.push(session);
    localStorage.setItem(COMPLETED_WORKOUTS_KEY, JSON.stringify(completedWorkouts));
    
    const currentDay = getCurrentRoutineDay();
    if (currentDay && !isRestDay(currentDay)) {
        incrementStreak();
    }
    
    localStorage.removeItem(ACTIVE_WORKOUT_SESSION_KEY);
    advanceRoutineDay();
    return true;
}

function getStreak() {
    const data = localStorage.getItem(STREAK_KEY);
    if (data) {
        return JSON.parse(data);
    }
    return { current: 0, best: 0 };
}

function setStreak(streak) {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
}

function incrementStreak() {
    const streak = getStreak();
    streak.current += 1;
    if (streak.current > streak.best) {
        streak.best = streak.current;
    }
    setStreak(streak);
}

function resetStreak() {
    const streak = getStreak();
    streak.current = 0;
    setStreak(streak);
}

function skipTrainingDay() {
    const currentDay = getCurrentRoutineDay();
    if (!currentDay || isRestDay(currentDay)) {
        return false;
    }
    
    resetStreak();
    advanceRoutineDay();
    return true;
}

function getCompletedWorkouts() {
    const data = localStorage.getItem(COMPLETED_WORKOUTS_KEY);
    return data ? JSON.parse(data) : [];
}

function getLastWorkoutSetsForExercise(exerciseName) {
    const completedWorkouts = getCompletedWorkouts();
    
    for (let i = completedWorkouts.length - 1; i >= 0; i--) {
        const workout = completedWorkouts[i];
        if (!workout.exercises) {
            continue;
        }
        
        const exercise = workout.exercises.find(ex => ex.name === exerciseName);
        if (exercise && exercise.sets && exercise.sets.length > 0) {
            return exercise.sets;
        }
    }
    
    return null;
}

function getPremadeExercises() {
    return [
        'Bench Press',
        'Squat',
        'Deadlift',
        'Overhead Press',
        'Pull-ups',
        'Rows'
    ];
}

function addExerciseToSession(exerciseName) {
    const session = getActiveWorkoutSession();
    if (!session || session.status !== 'active') {
        return false;
    }
    
    if (!session.exercises) {
        session.exercises = [];
    }
    
    const exercise = {
        id: Date.now().toString(),
        name: exerciseName,
        sets: []
    };
    
    session.exercises.push(exercise);
    localStorage.setItem(ACTIVE_WORKOUT_SESSION_KEY, JSON.stringify(session));
    return true;
}

function addSetToExercise(exerciseId, reps, weight) {
    const session = getActiveWorkoutSession();
    if (!session || session.status !== 'active') {
        return false;
    }
    
    const exercise = session.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) {
        return false;
    }
    
    if (!exercise.sets) {
        exercise.sets = [];
    }
    
    const set = {
        reps: parseInt(reps),
        weight: parseFloat(weight)
    };
    
    exercise.sets.push(set);
    localStorage.setItem(ACTIVE_WORKOUT_SESSION_KEY, JSON.stringify(session));
    return true;
}

function deleteLastSetFromExercise(exerciseId) {
    const session = getActiveWorkoutSession();
    if (!session || session.status !== 'active') {
        return false;
    }
    
    const exercise = session.exercises.find(ex => ex.id === exerciseId);
    if (!exercise || !exercise.sets || exercise.sets.length === 0) {
        return false;
    }
    
    exercise.sets.pop();
    localStorage.setItem(ACTIVE_WORKOUT_SESSION_KEY, JSON.stringify(session));
    return true;
}

function exportAllData() {
    const data = {
        user: localStorage.getItem(USER_DATA_KEY) ? JSON.parse(localStorage.getItem(USER_DATA_KEY)) : null,
        routines: getRoutines(),
        activeRoutineId: getActiveRoutineId(),
        currentRoutineDayIndex: getCurrentRoutineDayIndex(),
        workoutSession: getActiveWorkoutSession(),
        completedWorkouts: getCompletedWorkouts(),
        streak: getStreak()
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workout-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetAllData() {
    if (confirm('This will delete all data. Continue?')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}
