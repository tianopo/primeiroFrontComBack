import { CardContainer } from "src/components/Layout/CardContainer";
import { CSVUploader } from "./components/CSVUploader";
import { OFXUploader } from "./components/OFXUploader";

export const Closing = () => {
  return (
    <CardContainer>
      <div className="flex gap-3">
        <CSVUploader />
        <OFXUploader />
      </div>
    </CardContainer>
  );
};
