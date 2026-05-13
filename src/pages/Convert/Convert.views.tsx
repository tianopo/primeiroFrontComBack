import { CardContainer } from "src/components/Layout/CardContainer";
import { CSVUploader } from "./components/CSVUploader";
import { OFXUploader } from "./components/OFXUploader";
import { GowdOFXUploader } from "./components/GowdOFXUploader";

export const Convert = () => {
  return (
    <CardContainer full>
      <div className="flex gap-3">
        <CSVUploader />
        <OFXUploader />
      </div>
      <GowdOFXUploader />
    </CardContainer>
  );
};
