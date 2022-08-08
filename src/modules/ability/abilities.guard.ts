import { ForbiddenError } from "@casl/ability";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { CHECK_ABILITY, RequiredRule } from "src/modules/ability//ability.decorator";
import { AbilityFactory } from "src/modules/ability/ability.factory";

@Injectable() 
export class AbilitiesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private caslAbilityFactory: AbilityFactory,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const rules = this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) || [];

        const req  = context.switchToHttp().getRequest();
        const user = req.user;

        const ability = this.caslAbilityFactory.defineAbility(user);

        try {
            rules.forEach((rule) => 
                ForbiddenError.from(ability).throwUnlessCan(rule.action, rule.subject),
            );

            return true;
        } catch (error) {
            if ( error instanceof ForbiddenError) {
                throw new ForbiddenException(error.message);
            }
        }
    }
}