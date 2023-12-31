import "./Charts.css";
import jsonData from "../../data/charts.json";

const Charts = () => {
  const chart = JSON.parse(JSON.stringify(jsonData.chart1));
  const dealerRow = JSON.parse(JSON.stringify(jsonData.dealerRow));

  const determineColor = (value: string) => {
    switch (value) {
      case "H":
        return "green";
      case "S":
        return "red";
    }
  };

  return (
    <div className="table-container">
      <table className="chart-table">
        <tr>
          <th>{`Dealer's Card\nYour Hand`}</th>
          {dealerRow.map((data: number, i: number) => {
            return <th key={i}>{data}</th>;
          })}
        </tr>
        {chart.data.map(
          (data: { label: string; value: string[] }, i: number) => {
            return (
              <tr key={i}>
                <th>{data.label}</th>
                {data.value.map((value) => {
                  return (
                    <td
                      style={{
                        backgroundColor: determineColor(value),
                      }}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            );
          }
        )}
      </table>
      <table className="chart-table">
        <tr>
          <th>Your Hand\Dealer's Card</th>
          {dealerRow.map((data: number, i: number) => {
            return <th key={i}>{data}</th>;
          })}
        </tr>
        {chart.data2.map(
          (data: { label: string; value: string[] }, i: number) => {
            return (
              <tr key={i}>
                <th>{data.label}</th>
                {data.value.map((value) => {
                  return (
                    <td
                      style={{
                        backgroundColor: determineColor(value),
                      }}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            );
          }
        )}
      </table>
    </div>
  );
};

export default Charts;
