import { Body, Controller, Delete, Get, NotFoundException, Param, Put, UseGuards } from "@nestjs/common";
import { GetAllOverridesUseCase } from "../../../application/mission-overrides/get-all-overrides.use-case";
import { GetOverrideUseCase } from "../../../application/mission-overrides/get-override.use-case";
import { SaveOverrideUseCase } from "../../../application/mission-overrides/save-override.use-case";
import { DeleteOverrideUseCase } from "../../../application/mission-overrides/delete-override.use-case";
import { SessionAuthGuard } from "../guards/session-auth.guard";
import { SaveOverrideDto } from "../dto/save-override.dto";

// Las lecturas son públicas (las consumen las páginas públicas de guías,
// sin sesión de admin); solo escribir/borrar requiere estar logueado.
@Controller("mission-overrides")
export class MissionOverridesController {
  constructor(
    private readonly getAll: GetAllOverridesUseCase,
    private readonly getOne: GetOverrideUseCase,
    private readonly save: SaveOverrideUseCase,
    private readonly remove: DeleteOverrideUseCase
  ) {}

  @Get()
  findAll() {
    return this.getAll.execute();
  }

  @Get(":mision")
  async findOne(@Param("mision") mision: string) {
    const override = await this.getOne.execute(decodeURIComponent(mision));
    if (!override) throw new NotFoundException();
    return override;
  }

  @Put(":mision")
  @UseGuards(SessionAuthGuard)
  async update(@Param("mision") mision: string, @Body() dto: SaveOverrideDto) {
    await this.save.execute(decodeURIComponent(mision), dto);
    return { ok: true };
  }

  @Delete(":mision")
  @UseGuards(SessionAuthGuard)
  async remove_(@Param("mision") mision: string) {
    await this.remove.execute(decodeURIComponent(mision));
    return { ok: true };
  }
}
