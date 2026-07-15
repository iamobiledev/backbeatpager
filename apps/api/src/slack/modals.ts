import type { ModalView, PlainTextOption } from "@slack/types";

export interface OverrideModalSchedule {
  id: string;
  name: string;
  teamName: string;
  timezone: string;
}

function option(text: string, value: string): PlainTextOption {
  return {
    text: {
      emoji: true,
      text: text.slice(0, 75),
      type: "plain_text"
    },
    value
  };
}

export function buildManualIncidentModal(): ModalView {
  return {
    blocks: [
      {
        block_id: "service",
        dispatch_action: true,
        element: {
          action_id: "incident_service_options",
          min_query_length: 0,
          placeholder: {
            text: "Choose a service",
            type: "plain_text"
          },
          type: "external_select"
        },
        label: {
          text: "Service",
          type: "plain_text"
        },
        type: "input"
      },
      {
        block_id: "severity",
        element: {
          action_id: "value",
          initial_option: option("Critical", "critical"),
          options: [
            option("Critical", "critical"),
            option("Warning", "warning"),
            option("Info", "info")
          ],
          type: "static_select"
        },
        label: {
          text: "Severity",
          type: "plain_text"
        },
        type: "input"
      },
      {
        block_id: "summary",
        element: {
          action_id: "value",
          max_length: 1024,
          multiline: true,
          type: "plain_text_input"
        },
        label: {
          text: "Summary",
          type: "plain_text"
        },
        type: "input"
      },
      {
        block_id: "source_url",
        element: {
          action_id: "value",
          placeholder: {
            text: "https://monitoring.example.com/...",
            type: "plain_text"
          },
          type: "plain_text_input"
        },
        label: {
          text: "Source URL",
          type: "plain_text"
        },
        optional: true,
        type: "input"
      }
    ],
    callback_id: "incident_trigger_submit",
    close: {
      text: "Cancel",
      type: "plain_text"
    },
    submit: {
      text: "Trigger",
      type: "plain_text"
    },
    title: {
      text: "Trigger incident",
      type: "plain_text"
    },
    type: "modal"
  };
}

export function buildResolveIncidentModal(
  incidentNumber: number,
  privateMetadata: string
): ModalView {
  return {
    blocks: [
      {
        block_id: "resolution_note",
        element: {
          action_id: "value",
          max_length: 2000,
          multiline: true,
          placeholder: {
            text: "What fixed the incident?",
            type: "plain_text"
          },
          type: "plain_text_input"
        },
        label: {
          text: "Resolution note",
          type: "plain_text"
        },
        optional: true,
        type: "input"
      }
    ],
    callback_id: "incident_resolve_submit",
    close: {
      text: "Cancel",
      type: "plain_text"
    },
    private_metadata: privateMetadata,
    submit: {
      text: "Resolve",
      type: "plain_text"
    },
    title: {
      text: `Resolve #${incidentNumber}`.slice(0, 24),
      type: "plain_text"
    },
    type: "modal"
  };
}

export function buildOnCallOverrideModal(
  schedules: OverrideModalSchedule[],
  timezone: string,
  now = new Date()
): ModalView {
  const start = Math.floor(now.getTime() / 1000);
  const end = start + 4 * 60 * 60;

  return {
    blocks: [
      {
        block_id: "schedule",
        element: {
          action_id: "value",
          options: schedules
            .slice(0, 100)
            .map((schedule) =>
              option(
                `${schedule.teamName} · ${schedule.name} (${schedule.timezone})`,
                schedule.id
              )
            ),
          type: "static_select"
        },
        label: {
          text: "Schedule",
          type: "plain_text"
        },
        type: "input"
      },
      {
        block_id: "replacement",
        element: {
          action_id: "value",
          type: "users_select"
        },
        label: {
          text: "Covering engineer",
          type: "plain_text"
        },
        type: "input"
      },
      {
        block_id: "starts_at",
        element: {
          action_id: "value",
          initial_date_time: start,
          type: "datetimepicker"
        },
        label: {
          text: `Starts (${timezone})`.slice(0, 75),
          type: "plain_text"
        },
        type: "input"
      },
      {
        block_id: "ends_at",
        element: {
          action_id: "value",
          initial_date_time: end,
          type: "datetimepicker"
        },
        label: {
          text: `Ends (${timezone})`.slice(0, 75),
          type: "plain_text"
        },
        type: "input"
      },
      {
        block_id: "reason",
        element: {
          action_id: "value",
          max_length: 500,
          type: "plain_text_input"
        },
        label: {
          text: "Reason",
          type: "plain_text"
        },
        optional: true,
        type: "input"
      }
    ],
    callback_id: "oncall_override_submit",
    close: {
      text: "Cancel",
      type: "plain_text"
    },
    submit: {
      text: "Create override",
      type: "plain_text"
    },
    title: {
      text: "On-call override",
      type: "plain_text"
    },
    type: "modal"
  };
}
