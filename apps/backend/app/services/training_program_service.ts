import { DateTime } from 'luxon'
import TrainingProgram from '#models/training_program'
import TrainingTaskLog from '#models/training_task_log'
import type { TrainingPlan, TrainingPlanWeek } from '#services/training_service'
import { TRAINING_AXES, type TrainingAxis } from '#services/training/questionnaire'

export interface DailyTask {
  key: string
  title: string
  axis: TrainingAxis
  axisLabel: string
  duration: string
  steps: string[]
  tip: string
  done: boolean
}

const AXIS_LABEL = new Map(TRAINING_AXES.map((a) => [a.key, a.label]))

export default class TrainingProgramService {
  /** `c1-w2-e0` : le cycle est dans la clé, sinon les cochages d'un cycle
   * précédent réapparaîtraient sur le suivant. */
  taskKey(cycle: number, week: number, index: number): string {
    return `c${cycle}-w${week}-e${index}`
  }

  weekOf(plan: TrainingPlan, weekNumber: number): TrainingPlanWeek | undefined {
    return plan.weeks.find((w) => w.week === weekNumber) ?? plan.weeks[weekNumber - 1]
  }

  /**
   * Les exercices de la semaine courante, avec leur état pour le jour demandé.
   * Le cochage est quotidien : un même exercice se refait chaque jour, et la
   * liste repart à vide le lendemain.
   */
  async tasksForDay(program: TrainingProgram, day: DateTime): Promise<DailyTask[]> {
    const week = this.weekOf(program.plan, program.currentWeek)
    if (!week) return []

    const iso = day.toISODate()!
    const logs = await TrainingTaskLog.query()
      .where('programId', program.id)
      .where('day', iso)

    const done = new Set(logs.map((l) => l.taskKey))

    return week.exercises.map((exercise, index) => {
      const key = this.taskKey(program.cycle, program.currentWeek, index)
      return {
        key,
        title: exercise.title,
        axis: exercise.axis,
        axisLabel: AXIS_LABEL.get(exercise.axis) ?? exercise.axis,
        duration: exercise.duration,
        steps: exercise.steps,
        tip: exercise.tip,
        done: done.has(key),
      }
    })
  }

  /**
   * Coche ou décoche un exercice. Idempotent des deux côtés : un double appui
   * ne doit ni créer de doublon ni renvoyer d'erreur.
   */
  async toggleTask(params: {
    program: TrainingProgram
    userId: number
    day: DateTime
    taskKey: string
    done: boolean
  }): Promise<void> {
    const { program, userId, day, taskKey, done } = params
    const iso = day.toISODate()!

    if (done) {
      const existing = await TrainingTaskLog.query()
        .where('programId', program.id)
        .where('day', iso)
        .where('taskKey', taskKey)
        .first()
      if (!existing) {
        await TrainingTaskLog.create({
          programId: program.id,
          userId,
          day,
          taskKey,
        })
      }
      return
    }

    await TrainingTaskLog.query()
      .where('programId', program.id)
      .where('day', iso)
      .where('taskKey', taskKey)
      .delete()
  }

  /**
   * Assiduité de la semaine écoulée : jours où au moins un exercice a été
   * coché, sur les sept derniers. Sert à l'affichage et au prompt du cycle
   * suivant.
   */
  async weekAdherence(program: TrainingProgram): Promise<{ activeDays: number; totalChecks: number }> {
    const logs = await TrainingTaskLog.query()
      .where('programId', program.id)
      .where('day', '>=', program.weekStartedAt.toISODate()!)

    const days = new Set(logs.map((l) => l.day.toISODate()))
    return { activeDays: days.size, totalChecks: logs.length }
  }

  /**
   * Fait avancer le programme après un bilan hebdomadaire validé.
   * Au bout de la dernière semaine du plan, le programme passe en `completed` :
   * c'est le déclencheur de l'écran de fin de cycle côté app.
   */
  advanceAfterCheckin(program: TrainingProgram): { finished: boolean } {
    const lastWeek = program.plan.weeks.length

    if (program.currentWeek >= lastWeek) {
      program.status = 'completed'
      program.completedAt = DateTime.now()
      return { finished: true }
    }

    program.currentWeek += 1
    program.weekStartedAt = DateTime.now()
    return { finished: false }
  }

  /** Vue compacte pour l'accueil : rien de ce qui n'est pas affiché n'est calculé. */
  async summarize(program: TrainingProgram, day: DateTime) {
    const checkinDue = program.checkinDue
    // Tant que le bilan n'est pas fait, les exercices de la semaine suivante
    // ne sont pas servis : c'est le verrou qui rend le suivi réel plutôt
    // qu'une liste de cases à cocher indéfiniment.
    const tasks = checkinDue ? [] : await this.tasksForDay(program, day)
    const week = this.weekOf(program.plan, program.currentWeek)

    return {
      id: program.id,
      petId: program.petId,
      // La fiche animal ouvre le bilan à partir de là : sans cet identifiant
      // elle devrait faire un second appel pour retrouver le résultat.
      assessmentId: program.assessmentId,
      cycle: program.cycle,
      week: program.currentWeek,
      totalWeeks: program.plan.weeks.length,
      theme: week?.theme ?? '',
      goal: week?.goal ?? '',
      sessions: week?.sessions ?? '',
      successCriteria: week?.successCriteria ?? '',
      status: program.status,
      checkinDue,
      daysUntilCheckin: program.daysUntilCheckin,
      scores: program.scores,
      overallScore: program.overallScore,
      level: program.level,
      tasks,
      doneCount: tasks.filter((t) => t.done).length,
      totalCount: tasks.length,
      startedAt: program.startedAt,
      weekStartedAt: program.weekStartedAt,
    }
  }
}
