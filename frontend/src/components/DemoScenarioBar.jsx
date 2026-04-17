export function DemoScenarioBar({
  scenarios,
  activeScenario,
  onRunScenario,
  disabled,
}) {
  return (
    <section className="scenario-bar">
      <div>
        <p className="eyebrow">Demo Mode</p>
        <h2>Quick scenarios</h2>
      </div>

      <div className="scenario-list">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            className={`scenario-button ${
              activeScenario === scenario.id ? "scenario-button--active" : ""
            }`}
            onClick={() => onRunScenario(scenario)}
            disabled={disabled}
          >
            <strong>{scenario.title}</strong>
            <span>{scenario.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
