import {
    Container,
    Flex,
    Heading,
    Skeleton,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    Checkbox,
    Button,
    useToast,
} from "@chakra-ui/react";
import { useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import React, { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { RelationService } from "../../client";
import Navbar from "../../components/Common/Navbar";
import ActionsMenu from "../../components/Common/ActionsMenu.tsx";

export const Route = createFileRoute("/_layout/relations")({
    component: Relations,
});

function RelationsTableBody({ searchTerm, selectedRelations, setSelectedRelations, allSelected }) {
    const { data: relations } = useSuspenseQuery({
        queryKey: ["relations"],
        queryFn: () => RelationService.getRelations(),
    });

    const [filteredRelations, setFilteredRelations] = useState(relations.data);

    useEffect(() => {
        const filtered = relations.data.filter(relation =>
            relation.from_client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            relation.to_client_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredRelations(filtered);
    }, [searchTerm, relations.data]);

    useEffect(() => {
        if (allSelected) {
            setSelectedRelations(filteredRelations.map(relation => relation.id));
        } else {
            setSelectedRelations([]);
        }
    }, [allSelected, filteredRelations]);

    const handleCheckboxChange = (id) => {
        setSelectedRelations((prevSelectedRelations) => {
            if (prevSelectedRelations.includes(id)) {
                return prevSelectedRelations.filter(relationId => relationId !== id);
            } else {
                return [...prevSelectedRelations, id];
            }
        });
    };

    return (
        <Tbody>
            {filteredRelations.map((item) => (
                <Tr key={item.id}>
                    <Td>
                        <Checkbox
                            isChecked={selectedRelations.includes(item.id)}
                            onChange={() => handleCheckboxChange(item.id)}
                        />
                    </Td>
                    <Td>{item.id}</Td>
                    <Td>{item.fromClientId}</Td>
                    <Td>{item.from_client_name}</Td>
                    <Td>{item.toClientId}</Td>
                    <Td>{item.to_client_name}</Td>
                    <Td>{item.status === 0 ? "inactive" : "active"}</Td>
                    <Td>
                        <ActionsMenu
                            value={item}
                            type={"Relation"}
                        />
                    </Td>
                </Tr>
            ))}
        </Tbody>
    );
}

function RelationsTable({ searchTerm, selectedRelations, setSelectedRelations, allSelected }) {
    return (
        <TableContainer>
            <Table size={{ base: "sm", md: "md" }}>
                <Thead>
                    <Tr>
                        <Th> </Th>
                        <Th>ID</Th>
                        <Th>From Client ID</Th>
                        <Th>From Client Name</Th>
                        <Th>To Client ID</Th>
                        <Th>To Client Name</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <ErrorBoundary
                    fallbackRender={({ error }) => (
                        <Tbody>
                            <Tr>
                                <Td colSpan={8}>Something went wrong: {error.message}</Td>
                            </Tr>
                        </Tbody>
                    )}
                >
                    <Suspense
                        fallback={
                            <Tbody>
                                {new Array(5).fill(null).map((_, index) => (
                                    <Tr key={index}>
                                        {new Array(8).fill(null).map((_, index) => (
                                            <Td key={index}>
                                                <Flex>
                                                    <Skeleton height="20px" width="20px" />
                                                </Flex>
                                            </Td>
                                        ))}
                                    </Tr>
                                ))}
                            </Tbody>
                        }
                    >
                        <RelationsTableBody
                            searchTerm={searchTerm}
                            selectedRelations={selectedRelations}
                            setSelectedRelations={setSelectedRelations}
                            allSelected={allSelected}
                        />
                    </Suspense>
                </ErrorBoundary>
            </Table>
        </TableContainer>
    );
}

function Relations() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedRelations, setSelectedRelations] = useState([]);
    const [allSelected, setAllSelected] = useState(false);
    const toast = useToast();
    const mutation = useMutation({
        mutationFn: async () => {
            await Promise.all(selectedRelations.map(relationId => RelationService.deleteRelation({ relationId })));
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Selected relations have been deleted.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            setSelectedRelations([]);
            setAllSelected(false);
            setTimeout(() => {
                window.location.reload();
            }, 500);
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: `Error deleting relations: ${error.message}`,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    });

    const handleDeleteSelected = () => {
        mutation.mutate();
    };

    const handleSelectAll = () => {
        setAllSelected(!allSelected);
    };

    return (
        <Container maxW="full">
            <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
                Relations Management
            </Heading>
            <Navbar type={"Relation"} onSearch={setSearchTerm} />
            <Button
                colorScheme="red"
                onClick={handleDeleteSelected}
                isDisabled={selectedRelations.length === 0}
                mt={4}
            >
                Delete Selected Relations
            </Button>
            <Button
                colorScheme="blue"
                onClick={handleSelectAll}
                mt={4}
                ml={2}
            >
                {allSelected ? "Deselect All" : "Select All"}
            </Button>
            <Suspense fallback={<Skeleton height="40px" count={5} />}>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <RelationsTable
                        searchTerm={searchTerm}
                        selectedRelations={selectedRelations}
                        setSelectedRelations={setSelectedRelations}
                        allSelected={allSelected}
                    />
                </ErrorBoundary>
            </Suspense>
        </Container>
    );
}

function ErrorFallback({ error }) {
    return <div>Something went wrong: {error.message}</div>;
}
