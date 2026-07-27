export interface Step {
  texto: string;
  imagen: string | null;
}

export class MissionOverride {
  constructor(
    public readonly mision: string,
    public readonly nombreEs: string | null,
    public readonly pasos: Step[]
  ) {}
}
