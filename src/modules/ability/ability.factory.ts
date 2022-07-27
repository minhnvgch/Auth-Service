import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { UserEntity } from "src/entities/user.entity";

export enum Action {
    Manage = 'manage',
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Delete = 'delete',
}

export type Subjects = InferSubjects<typeof UserEntity> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
    defineAbility(user: UserEntity) {
        const { can, cannot, build} = new AbilityBuilder(
            Ability as AbilityClass<AppAbility>
        );
        
        if (user.is_admin == 'true') {
            can(Action.Manage, 'all');
        } else {
            can(Action.Read, UserEntity);
        }

        return build({
            detectSubjectType: (item) => 
            item.constructor as ExtractSubjectType<Subjects> 
        });
    }
}