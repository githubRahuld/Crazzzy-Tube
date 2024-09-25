import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { useDisclosure } from "@nextui-org/react"; //for modal

const ThreeDots = ({ playlist }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const [deletedMsg, setDeletedMsg] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleDeletePlaylist = async () => {
    await axios
      .delete(`${baseUrl}/api/v1/playlists/${playlist.playlist._id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
      })
      .then((res) => {
        setDeletedMsg(`${playlist.name} deleted Suncessfully`);
        console.log(res.data);

        window.location.reload(); //page reload
      })
      .catch((err) => {
        console.log("Error while deleting playlist: ", err);
      });
  };

  const handleEditButton = () => {
    setShowPlaylistModal(true);
  };

  const handleEditPlaylist = async () => {
    setDeletedMsg("");
    await axios
      .patch(
        `${baseUrl}/api/v1/playlists/update-playlist/${playlist.playlist._id}`,
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      )
      .then((res) => {
        alert(`${playlist.name} edited Suncessfully`);
        console.log(res.data);
      })
      .catch((err) => {
        console.log("Error while editing playlist: ", err);
      });
  };

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button variant="">
            <BsThreeDotsVertical className="hover:text-xl" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Action event example">
          <DropdownItem key="edit" onPress={onOpen} onClick={handleEditButton}>
            Edit Playlist
          </DropdownItem>
          <DropdownItem
            key="deleted"
            className="text-danger"
            color="danger"
            onClick={handleDeletePlaylist}
          >
            Delete Playlist
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {showPlaylistModal && (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Edit playlist
                </ModalHeader>
                <ModalBody>
                  <form onSubmit={handleEditPlaylist}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded"
                        placeholder="Enter playlist name"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={description}
                        name="description"
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="Enter playlist description"
                        rows="3"
                      />
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        Update
                      </button>
                    </div>
                  </form>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default ThreeDots;
