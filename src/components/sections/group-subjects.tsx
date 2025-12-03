import { useState } from "react";

type Card = { title: string; subjects: string[] };

const DEFAULT_CARDS: Card[] = [
  {
    title: "GRUPO A",
    subjects: [
      "Competencia Comunicativa",
      "Matemática I - Aritmética",
      "Matemática I - Álgebra",
      "Economía",
      "Matemática II - Geometría y Trigonometría",
      "Física",
    ],
  },
  {
    title: "GRUPO B",
    subjects: [
      "Competencia Comunicativa",
      "Matemática I - Aritmética",
      "Matemática I - Álgebra",
      "Economía",
      "Biología",
      "Química",
    ],
  },
  {
    title: "GRUPO C",
    subjects: [
      "Competencia Comunicativa",
      "Matemática I - Aritmética",
      "Matemática I - Álgebra",
      "Economía",
      "Geografía",
      "Historia",
    ],
  },
];

export default function GroupSubjectsSection() {
  // Datos fijos tal como en la imagen proporcionada
  const [cards] = useState<Card[]>(DEFAULT_CARDS);

  return (
    <section className="py-10 md:py-14" id="asignaturas-por-grupo">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight mb-6">
          ASIGNATURAS POR GRUPOS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-xl border shadow-sm overflow-hidden bg-card text-card-foreground"
            >
              {/* Header */}
              <div className="bg-primary text-primary-foreground">
                <div className="px-4 py-2 text-xs uppercase tracking-wide/80 opacity-80">
                  Asignaturas
                </div>
                <div className="px-4 py-3 text-lg font-semibold">
                  {card.title}
                </div>
              </div>
              {/* Body */}
              <ul className="divide-y">
                {card.subjects.map((s, i) => (
                  <li
                    key={i}
                    className={`px-4 py-3 text-sm ${
                      i % 2 === 1 ? "bg-muted/40" : ""
                    }`}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
