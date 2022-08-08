import { Module } from "@nestjs/common";
import { AbilityFactory } from "src/modules/ability/ability.factory";

@Module({
    providers: [AbilityFactory],
    exports: [AbilityFactory]
})

export class AbilityModule {}