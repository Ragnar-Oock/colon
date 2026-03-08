import { addService, definePlugin, defineService, dependsOn, onBeforeCreate, onCreated } from "@xoram/core";
import type { StoreAsService } from "@xoram/plugin-panoramique";
import {
	addChild,
	defineComponentDefinition,
	panoramiquePlugin,
	register,
	rootHarness
} from "@xoram/plugin-panoramique";
import { watchEffect } from "vue";
import { savePlugin } from "../save/save.plugin";
import ScoreDisplay from "./score-display.vue";
import { useScoreStore } from "./score.store";


export type ScoreNotifications = {
	scored: { amount: number };
}

const SCORE = 'colon.score' as const;

declare module '../save/save.service' {
	interface DataTypes {
		[SCORE]: number;
	}
}


declare module '@xoram/core' {
	interface ServiceCollection {
		score: StoreAsService<typeof useScoreStore>;
	}
}

export const scorePlugin = definePlugin('score', () => {
	dependsOn(savePlugin);
	dependsOn(panoramiquePlugin);

	addService('score', defineService(({services: {pinia}}) => useScoreStore(pinia.pinia)));

	register(defineComponentDefinition('score', ScoreDisplay));
	addChild(rootHarness, 'score');

	onBeforeCreate(({services: {save}}) => {
		save.registerSerDe({
			type: SCORE,
			serialize(score) {
				return score.toString(32);
			},
			deserialize(data) {
				return Number.parseInt(data, 32);
			}
		})
	})

	onCreated(({services: {score, save}}) => {
		score.score = save.load(SCORE, () => 0);
		watchEffect(() => save.save(SCORE, score.score));
	})
})