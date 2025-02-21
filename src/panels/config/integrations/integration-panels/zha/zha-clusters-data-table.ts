import type { TemplateResult } from "lit";
import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators";
import memoizeOne from "memoize-one";
import "../../../../../components/data-table/ha-data-table";
import type {
  DataTableColumnContainer,
  HaDataTable,
} from "../../../../../components/data-table/ha-data-table";
import type { Cluster } from "../../../../../data/zha";
import type { HomeAssistant } from "../../../../../types";
import { formatAsPaddedHex } from "./functions";

export interface ClusterRowData extends Cluster {
  cluster?: Cluster;
  cluster_id?: string;
}

@customElement("zha-clusters-data-table")
export class ZHAClustersDataTable extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public clusters: Cluster[] = [];

  @query("ha-data-table", true) private _dataTable!: HaDataTable;

  private _clusters = memoizeOne((clusters: Cluster[]) => {
    let outputClusters: ClusterRowData[] = clusters;

    outputClusters = outputClusters.map((cluster) => ({
      ...cluster,
      cluster_id: cluster.endpoint_id + "-" + cluster.id,
    }));

    return outputClusters;
  });

  private _columns = memoizeOne(
    (narrow: boolean): DataTableColumnContainer<ClusterRowData> =>
      narrow
        ? {
            name: {
              title: "Name",
              sortable: true,
              direction: "asc",
              flex: 2,
            },
          }
        : {
            name: {
              title: "Name",
              sortable: true,
              direction: "asc",
              flex: 2,
            },
            id: {
              title: "ID",
              template: (cluster) => html` ${formatAsPaddedHex(cluster.id)} `,
              sortable: true,
            },
            endpoint_id: {
              title: "Endpoint ID",
              sortable: true,
            },
          }
  );

  public clearSelection() {
    this._dataTable.clearSelection();
  }

  protected render(): TemplateResult {
    return html`
      <ha-data-table
        .hass=${this.hass}
        .columns=${this._columns(this.narrow)}
        .data=${this._clusters(this.clusters)}
        .id=${"cluster_id"}
        selectable
        auto-height
        .searchLabel=${this.hass.localize("ui.components.data-table.search")}
        .noDataText=${this.hass.localize("ui.components.data-table.no-data")}
      ></ha-data-table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "zha-clusters-data-table": ZHAClustersDataTable;
  }
}
