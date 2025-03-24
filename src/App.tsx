import { FormEvent, useState } from "react";
import { Loader, Placeholder } from "@aws-amplify/ui-react";
import "./App.css";
import { Amplify } from "aws-amplify";
import { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";

import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const amplifyClient = generateClient<Schema>({
  authMode: "userPool",
});

function App() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [queryType, setQueryType] = useState<"single" | "multi">("single");
  const [operationType, setOperationType] = useState<string>("travel");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const interestsValue = formData.get("interests")?.toString() || "";

      if (queryType === "single") {
        const { data, errors } = await amplifyClient.queries.askBedrock({
          interests: [interestsValue],
        });
        if (!errors) {
          setResult(data?.body || "No data returned");
        } else {
          console.error(errors);
        }
      } else {
        const { data, errors } = await amplifyClient.queries.askBedrockMulti({
          operationType,
          interests: [interestsValue],
        });
        if (!errors) {
          setResult(data?.body || "No data returned");
        } else {
          console.error(errors);
        }
      }
    } catch (e) {
      alert(`An error occurred: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-header">
          Meet Your <span className="highlight">AI Helper</span>
        </h1>
        <p className="description">
          Type some interests and choose a use case. Then let your AI buddy
          provide suggestions or solutions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div>
          <label>
            <strong>Query Type:</strong>
            <select
              value={queryType}
              onChange={(e) =>
                setQueryType(e.target.value as "single" | "multi")
              }
            >
              <option value="single">Single (Travel Only)</option>
              <option value="multi">Multi (Various Use Cases)</option>
            </select>
          </label>
        </div>

        {queryType === "multi" && (
          <div>
            <label>
              <strong>Operation Type:</strong>
              <select
                value={operationType}
                onChange={(e) => setOperationType(e.target.value)}
              >
                <option value="travel">Travel</option>
                <option value="food">Food</option>
                <option value="studyPlan">Study Plan</option>
                <option value="custom">Custom (General Help)</option>
              </select>
            </label>
          </div>
        )}

        <div className="search-container">
          <input
            type="text"
            className="wide-input"
            id="interests"
            name="interests"
            placeholder="interest1, interest2, interest3,...etc"
          />
          <button type="submit" className="search-button">
            Generate
          </button>
        </div>
      </form>

      <div className="result-container">
        {loading ? (
          <div className="loader-container">
            <p>Loading...</p>
            <Loader size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
          </div>
        ) : (
          result && <p className="result">{result}</p>
        )}
      </div>
    </div>
  );
}

export default App;
