import { X } from "@phosphor-icons/react";
import { Flex } from "../../Flex/Flex";
import { FlexCol } from "../../Flex/FlexCol";
interface IModalPix {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  showModal: boolean;
}

export const ModalPagamento = ({ setShowModal, showModal }: IModalPix) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75">
      <FlexCol className="h-3/5 w-4/5 overflow-y-auto rounded-2xl bg-white p-3">
        <Flex className="justify-end">
          <X
            size={24}
            className="cursor-pointer text-blue-800"
            onClick={() => setShowModal(!showModal)}
          />
        </Flex>
      </FlexCol>
    </div>
  );
};
