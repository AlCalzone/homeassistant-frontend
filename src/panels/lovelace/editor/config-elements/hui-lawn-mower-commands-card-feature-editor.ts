import type { HassEntity } from "home-assistant-js-websocket";
import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { fireEvent } from "../../../../common/dom/fire_event";
import type { LocalizeFunc } from "../../../../common/translations/localize";
import type { SchemaUnion } from "../../../../components/ha-form/types";
import "../../../../components/ha-form/ha-form";
import type { HomeAssistant } from "../../../../types";
import { supportsLawnMowerCommand } from "../../card-features/hui-lawn-mower-commands-card-feature";
import type {
  LawnMowerCommandsCardFeatureConfig,
  LovelaceCardFeatureContext,
} from "../../card-features/types";
import { LAWN_MOWER_COMMANDS } from "../../card-features/types";
import type { LovelaceCardFeatureEditor } from "../../types";

@customElement("hui-lawn-mower-commands-card-feature-editor")
export class HuiLawnMowerCommandsCardFeatureEditor
  extends LitElement
  implements LovelaceCardFeatureEditor
{
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public context?: LovelaceCardFeatureContext;

  @state() private _config?: LawnMowerCommandsCardFeatureConfig;

  public setConfig(config: LawnMowerCommandsCardFeatureConfig): void {
    this._config = config;
  }

  private _schema = memoizeOne(
    (localize: LocalizeFunc, stateObj?: HassEntity) =>
      [
        {
          name: "commands",
          selector: {
            select: {
              multiple: true,
              mode: "list",
              options: LAWN_MOWER_COMMANDS.filter(
                (command) =>
                  stateObj && supportsLawnMowerCommand(stateObj, command)
              ).map((command) => ({
                value: command,
                label: `${localize(
                  `ui.panel.lovelace.editor.features.types.lawn-mower-commands.commands_list.${command}`
                )}`,
              })),
            },
          },
        },
      ] as const
  );

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const stateObj = this.context?.entity_id
      ? this.hass.states[this.context?.entity_id]
      : undefined;

    const schema = this._schema(this.hass.localize, stateObj);

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schema}
        .computeLabel=${this._computeLabelCallback}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    fireEvent(this, "config-changed", { config: ev.detail.value });
  }

  private _computeLabelCallback = (
    schema: SchemaUnion<ReturnType<typeof this._schema>>
  ) => {
    switch (schema.name) {
      case "commands":
        return this.hass!.localize(
          `ui.panel.lovelace.editor.features.types.lawn-mower-commands.${schema.name}`
        );
      default:
        return this.hass!.localize(
          `ui.panel.lovelace.editor.card.generic.${schema.name}`
        );
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-lawn-mower-commands-card-feature-editor": HuiLawnMowerCommandsCardFeatureEditor;
  }
}
