import React from "react";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiEdit, FiTrash } from "react-icons/fi";

import type { ItemPublic, UserPublic, ClientPublic, RelationPublic } from "../../client";
import EditUser from "../Admin/EditUser";
import EditItem from "../Items/EditItem";
import EditClient from "../Clients/EditClient";
import Delete from "./DeleteAlert";

interface ActionsMenuProps {
  type: string;
  value: ItemPublic | UserPublic | ClientPublic | RelationPublic;
  disabled?: boolean;
}

const ActionsMenu = ({ type, value, disabled }: ActionsMenuProps) => {
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();

  const handleEditClick = () => {
    editModal.onOpen();
  };

  const handleDeleteClick = () => {
    deleteModal.onOpen();
  };

  return (
    <>
      <Menu>
        <MenuButton
          isDisabled={disabled}
          as={Button}
          rightIcon={<BsThreeDotsVertical />}
          variant="unstyled"
        />
        <MenuList>
          <MenuItem onClick={handleEditClick} icon={<FiEdit fontSize="16px" />}>
            Edit {type}
          </MenuItem>
          <MenuItem
            onClick={handleDeleteClick}
            icon={<FiTrash fontSize="16px" />}
            color="ui.danger"
          >
            Delete {type}
          </MenuItem>
        </MenuList>
        {type === "User" ? (
          <EditUser
            user={value as UserPublic}
            isOpen={editModal.isOpen}
            onClose={editModal.onClose}
          />
        ) : type === "Item" ? (
          <EditItem
            item={value as ItemPublic}
            isOpen={editModal.isOpen}
            onClose={editModal.onClose}
          />
        ) : (
          <EditClient
            client={value as ClientPublic}
            isOpen={editModal.isOpen}
            onClose={editModal.onClose}
          />
        )}
        <Delete
          type={type}
          id={value?.id}
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.onClose}
        />
      </Menu>
    </>
  );
};

export default ActionsMenu;
