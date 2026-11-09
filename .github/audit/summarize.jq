# Компактная выжимка Lighthouse-отчёта для агента. Сырой JSON остаётся
# артефактом и доступен агенту по пути $AUDIT_DIR/lighthouse-report*.json.
def failing_audits:
  . as $report
  | [
      (.categories // {}) | to_entries[] as $category
      | ($category.value.auditRefs // [])[] as $ref
      | ($report.audits // {})[$ref.id] as $audit
      | select($audit != null)
      | select($audit.score != null and $audit.score < 1)
      | select(
          ($audit.scoreDisplayMode // "") as $mode
          | ($mode != "notApplicable"
            and $mode != "informative"
            and $mode != "manual")
        )
      | {
          category: $category.key,
          categoryTitle: ($category.value.title // $category.key),
          weight: ($ref.weight // 0),
          id: ($audit.id // $ref.id),
          title: ($audit.title // $ref.id),
          description: ($audit.description // ""),
          score: $audit.score,
          displayValue: ($audit.displayValue // ""),
          savingsMs: ($audit.details.overallSavingsMs // null),
          savingsBytes: ($audit.details.overallSavingsBytes // null)
        }
    ]
  | unique_by(.id)
  | sort_by(-((.weight // 0) * (1 - (.score // 0))));

failing_audits as $failing
| {
    finalUrl: (.finalUrl // ""),
    fetchTime: (.fetchTime // ""),
    training: (.__training__ // false),
    trainingNote: (.trainingNote // ""),
    categories:
      ((.categories // {})
        | to_entries
        | map({
            key: .key,
            value: {
              id: (.value.id // .key),
              title: (.value.title // .value.id // .key),
              score: .value.score
            }
          })
        | from_entries),
    failingCount: ($failing | length),
    failingAudits: $failing
  }
