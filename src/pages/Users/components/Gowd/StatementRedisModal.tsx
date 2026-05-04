// StatementRedisModal.tsx
import { Modal } from "src/components/Modal/Modal";
import { StatementRedisPanel } from "./StatementRedisPanel";

export const StatementRedisModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <Modal onClose={onClose} fit={false}>
      <StatementRedisPanel onVerifiedSuccess={onClose} closeOnSuccess />
    </Modal>
  );
};
