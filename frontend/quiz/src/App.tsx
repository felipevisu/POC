import { useMemo, useState } from 'react'
import modulesData from './data/questions.json'
import './App.css'

type Question = {
  id: string
  question: string
  options: string[]
  answerIndex: number
}

type Module = {
  id: string
  title: string
  description: string
  questions: Question[]
}

type ModuleData = {
  modules: Module[]
}

const pickRandom = (items: Question[], count: number) => {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

const shuffleQuestionOptions = (question: Question): Question => {
  const indexedOptions = question.options.map((option, index) => ({
    option,
    index
  }))
  for (let i = indexedOptions.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indexedOptions[i], indexedOptions[j]] = [indexedOptions[j], indexedOptions[i]]
  }
  const newAnswerIndex = indexedOptions.findIndex(
    (item) => item.index === question.answerIndex
  )

  return {
    ...question,
    options: indexedOptions.map((item) => item.option),
    answerIndex: newAnswerIndex
  }
}

function App() {
  const modules = useMemo(
    () => (modulesData as ModuleData).modules ?? [],
    []
  )
  const [status, setStatus] = useState<'idle' | 'inProgress' | 'finished'>(
    'idle'
  )
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const selectedModule = useMemo(
    () => modules.find((module) => module.id === selectedModuleId) ?? null,
    [modules, selectedModuleId]
  )

  const totalQuestions = sessionQuestions.length
  const currentQuestion = sessionQuestions[currentIndex]

  const startTraining = () => {
    if (!selectedModule) return
    const picked = pickRandom(selectedModule.questions, 10).map(
      shuffleQuestionOptions
    )
    setSessionQuestions(picked)
    setCurrentIndex(0)
    setSelectedOption(null)
    setScore(0)
    setStatus('inProgress')
  }

  const restart = () => {
    setStatus('idle')
    setSessionQuestions([])
    setCurrentIndex(0)
    setSelectedOption(null)
    setScore(0)
  }

  const handleSelect = (optionIndex: number) => {
    if (!currentQuestion || selectedOption !== null) return
    setSelectedOption(optionIndex)
    if (optionIndex === currentQuestion.answerIndex) {
      setScore((prev) => prev + 1)
    }
  }

  const goNext = () => {
    if (currentIndex + 1 >= totalQuestions) {
      setStatus('finished')
      return
    }
    setCurrentIndex((prev) => prev + 1)
    setSelectedOption(null)
  }

  return (
    <div className="app">
      <header className="hero">
        <span className="eyebrow">Treinamento musical</span>
        <h1>Quiz Session</h1>
        <p>
          Escolha um módulo e inicie uma sessão com 10 questões sorteadas.
        </p>
      </header>

      {status === 'idle' && (
        <section className="card">
          <h2>Selecione o módulo</h2>
          <div className="modules">
            {modules.map((module) => (
              <button
                key={module.id}
                className={
                  module.id === selectedModuleId
                    ? 'module-card selected'
                    : 'module-card'
                }
                onClick={() => setSelectedModuleId(module.id)}
              >
                <div>
                  <h3>{module.title}</h3>
                  <p className="muted">{module.description}</p>
                </div>
                <span className="pill">{module.questions.length} questões</span>
              </button>
            ))}
          </div>
          <button
            className="primary"
            onClick={startTraining}
            disabled={!selectedModule}
          >
            Iniciar treinamento
          </button>
        </section>
      )}

      {status === 'inProgress' && currentQuestion && (
        <section className="card">
          <div className="progress">
            <span>
              {selectedModule?.title} • Questão {currentIndex + 1} de{' '}
              {totalQuestions}
            </span>
            <span className="pill">Score: {score}</span>
          </div>

          <h2>{currentQuestion.question}</h2>
          <div className="options">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index
              const isCorrect = currentQuestion.answerIndex === index
              const showResult = selectedOption !== null
              const className = showResult
                ? isCorrect
                  ? 'option correct'
                  : isSelected
                    ? 'option incorrect'
                    : 'option'
                : 'option'

              return (
                <button
                  key={option}
                  className={className}
                  onClick={() => handleSelect(index)}
                  disabled={selectedOption !== null}
                >
                  {option}
                </button>
              )
            })}
          </div>

          <div className="actions">
            <button className="ghost" onClick={restart}>
              Encerrar sessão
            </button>
            <button
              className="primary"
              onClick={goNext}
              disabled={selectedOption === null}
            >
              {currentIndex + 1 >= totalQuestions ? 'Finalizar' : 'Próxima'}
            </button>
          </div>
        </section>
      )}

      {status === 'finished' && (
        <section className="card">
          <h2>Sessão concluída</h2>
          <p className="score">
            Você acertou <strong>{score}</strong> de{' '}
            <strong>{totalQuestions}</strong>
          </p>
          <p className="muted">
            Aproveitamento:{' '}
            {totalQuestions ? Math.round((score / totalQuestions) * 100) : 0}%
          </p>
          <button className="primary" onClick={startTraining}>
            Iniciar nova sessão
          </button>
          <button className="ghost" onClick={restart}>
            Voltar ao início
          </button>
        </section>
      )}
    </div>
  )
}

export default App
