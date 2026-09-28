import { unstable_rethrow } from "next/navigation";
import { adminFetch } from "@/lib/admin-session";
import "../quests/quests.css";
import "../realms/realms.css";
import "./card-skills.css";

type CardSkill = {
  _id: string;
  legacy_id: number;
  name: string;
  type: number;
  target: number;
  probability: number;
  attributes: string[];
  effect: number;
  is_value: boolean;
  effect_type: number;
  rarity: number;
  is_active: boolean;
};

const statNames: Record<number, string> = { 1: "Valor", 2: "Fortitude", 3: "Valor & Fortitude" };
const targetNames: Record<number, string> = { 1: "Allies", 2: "Enemies" };

export default async function CardSkillsPage() {
  let result: { data: CardSkill[]; total: number; source: string } | null = null;
  try {
    const response = await adminFetch(`/admin/card-skills`, {
      cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (response.ok) result = await response.json();
  } catch (error) { unstable_rethrow(error); }

  return <section>
    <p className="eyebrow">Reference data</p>
    <div className="list-heading"><div><h1>Card Skills</h1><p className="muted">Battle skills imported from the Varhara master data.</p></div></div>
    {!result ? <p role="alert" className="error">Unable to load card skills. Check the backend connection and refresh.</p> : (
      <div className="quest-table-wrap"><div className="quest-table-scroll"><table className="quest-table card-skills-table">
        <caption className="quest-caption">{result.total} card skills · Source: {result.source}</caption>
        <thead><tr>{["No", "Mongo ID", "Legacy ID", "Name", "Skill stat", "Target", "Chance", "Attributes", "Effect", "Effect stat", "Rarity", "Status"].map((name) => <th key={name}>{name}</th>)}</tr></thead>
        <tbody>{result.data.length ? result.data.map((skill, index) => <tr key={skill._id}>
          <td>{index + 1}</td><td className="skill-mongo-id">{skill._id}</td><td>{skill.legacy_id}</td>
          <td className="quest-name"><strong>{skill.name}</strong></td><td>{statNames[skill.type] || skill.type}</td>
          <td>{targetNames[skill.target] || skill.target}</td><td>{skill.probability}%</td>
          <td><div className="skill-attributes">{skill.attributes.map((attribute) => <span key={attribute}>{attribute}</span>)}</div></td>
          <td className={skill.effect < 0 ? "negative-effect" : "positive-effect"}>{skill.effect > 0 ? "+" : ""}{skill.effect}{skill.is_value ? "" : "%"}</td>
          <td>{statNames[skill.effect_type] || skill.effect_type}</td><td>{skill.rarity}</td>
          <td><span className="realm-status">{skill.is_active ? "Active" : "Inactive"}</span></td>
        </tr>) : <tr><td colSpan={12} className="quest-empty">No card skills are available. Refresh after the Varhara import completes.</td></tr>}</tbody>
      </table></div></div>
    )}
  </section>;
}
