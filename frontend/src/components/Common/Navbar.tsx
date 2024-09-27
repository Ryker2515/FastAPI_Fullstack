import {Button, Flex, Icon, useDisclosure, InputGroup, InputLeftElement, Input, Box, Stack} from "@chakra-ui/react"
import {FaPlus, FaSearch, FaUpload} from "react-icons/fa"

import AddUser from "../Admin/AddUser"
import AddItem from "../Items/AddItem"
import AddClient from "../Clients/AddClient"
import AddRelation from "../Relations/AddRelation"
import React, {useRef, useState} from "react";
import {ClientService} from "../../client";

interface NavbarProps {
    type: string;
    onSearch?: (searchTerm: string) => void;
}

const Navbar = ({type, onSearch}: NavbarProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const addUserModal = useDisclosure()
    const addItemModal = useDisclosure()
    const addClientModal = useDisclosure();
    const addRelationModal = useDisclosure();

    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [groupName, setGroupName] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            try {
                await ClientService.createClientsFromFile(formData, groupName);
                // alert('File uploaded successfully');
                window.location.reload();
                setSelectedFile(null); // Clear the selected file after successful upload
                fileInputRef.current = null;
                setGroupName('');
            } catch (error) {
                console.log(error)
            }
        } else {
            alert('No file selected');
        }
    };

    const handleAddClick = () => {
        if (type === "Client") {
            addClientModal.onOpen();
        } else if (type === "Relation") {
            addRelationModal.onOpen();
        } else {
            type === "User" ? addUserModal.onOpen() : addItemModal.onOpen();
        }
    };
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm);
        if (onSearch) {
            onSearch(newSearchTerm);
        }
    };

    return (
        <>
            <Flex py={8} gap={4}>
                {/* TODO: Complete search functionality */}
                {<InputGroup w={{base: '100%', md: 'auto'}}>
                    <InputLeftElement pointerEvents='none'>
                        <Icon as={FaSearch} color='ui.dim'/>
                    </InputLeftElement>
                    <Input
                        type='text'
                        placeholder='Search'
                        value={searchTerm}
                        onChange={handleSearchChange}
                        fontSize={{base: 'sm', md: 'inherit'}}
                        borderRadius='8px'
                    /> </InputGroup>}
                <Button
                    variant="primary"
                    gap={1}
                    fontSize={{base: "sm", md: "inherit"}}
                    onClick={handleAddClick}
                >
                    <Icon as={FaPlus}/> Add {type}
                </Button>
                {type.toLowerCase() === "client" && (
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={4} direction="column">
                            <Input
                                type="text"
                                placeholder='Group Name'
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                width="250px"
                            />
                            <Input
                                type="file"
                                ref={fileInputRef}
                                accept=".csv"
                                onChange={handleFileChange}
                                variant="outline"
                                borderColor="gray.300"
                                _hover={{ borderColor: 'gray.500' }}
                                _focus={{ borderColor: 'gray.500', boxShadow: 'outline' }}
                                width="250px"
                            />
                            <Button
                                type="submit" // Change to type submit to trigger form submission
                                variant="primary"
                                gap={1}
                                fontSize={{ base: "sm", md: "inherit" }}
                            >
                                <Icon as={FaUpload} /> Upload .csv file
                            </Button>
                        </Stack>
                    </form> )}
                <AddUser isOpen={addUserModal.isOpen} onClose={addUserModal.onClose}/>
                <AddItem isOpen={addItemModal.isOpen} onClose={addItemModal.onClose}/>
                <AddClient isOpen={addClientModal.isOpen} onClose={addClientModal.onClose}/>
                <AddRelation isOpen={addRelationModal.isOpen} onClose={addRelationModal.onClose}/>
            </Flex>
        </>
    )
}

export default Navbar
