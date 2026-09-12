import Button from "../ui/Button";

export default function SectionActions({ onDiscard, onSave }) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="secondary" onClick={onDiscard}>
        Discard changes
      </Button>
      <Button icon="check" onClick={onSave}>
        Save Changes
      </Button>
    </div>
  );
}