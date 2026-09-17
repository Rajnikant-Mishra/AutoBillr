import Card from "../../components/ui/Card";

export default function TeamAuditLog({
  activities = [],
}) {
  return (
    <Card className="p-6">
      <h2 className="
        text-lg
        font-bold
        text-text
      ">
        Audit log
      </h2>

      <p className="
        text-sm
        text-text-muted
        mt-1
      ">
        Recent team and permission
        activity will appear here.
      </p>

      {activities.length === 0 ? (
        <div className="
          mt-6
          p-8
          rounded-lg
          bg-surface-secondary
          border border-border-light
          text-center
        ">
          <span
            className="
              material-symbols-outlined
              text-text-light
            "
            style={{
              fontSize: 28,
            }}
          >
            history
          </span>

          <p className="
            text-sm
            font-medium
            text-text-secondary
            mt-2
          ">
            No activity yet
          </p>

          <p className="
            text-xs
            text-text-muted
            mt-1
          ">
            Team and permission activity
            will appear here.
          </p>
        </div>
      ) : (
        <div className="
          mt-6
          divide-y
          divide-border-light
        ">
          {activities.map(
            (activity, index) => (
              <div
                key={
                  activity.id ||
                  index
                }
                className="
                  py-4
                  flex
                  items-start
                  gap-3
                "
              >
                <div className="
                  w-9
                  h-9
                  rounded-full
                  bg-primary-soft
                  text-primary
                  grid
                  place-items-center
                  shrink-0
                ">
                  <span
                    className="
                      material-symbols-outlined
                    "
                    style={{
                      fontSize: 18,
                    }}
                  >
                    history
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="
                    text-sm
                    font-medium
                    text-text
                  ">
                    {activity.action ||
                      "Team activity"}
                  </p>

                  {activity.description && (
                    <p className="
                      text-xs
                      text-text-muted
                      mt-1
                    ">
                      {
                        activity.description
                      }
                    </p>
                  )}

                  {activity.createdAt && (
                    <p className="
                      text-[11px]
                      text-text-light
                      mt-1
                    ">
                      {new Date(
                        activity.createdAt
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </Card>
  );
}