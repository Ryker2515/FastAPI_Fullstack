import {
    Container,
    Heading,
    Skeleton,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useToast,
    Checkbox,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton
} from "@chakra-ui/react";
import {ChevronDownIcon} from "@chakra-ui/icons";
import {useSuspenseQuery, useMutation} from "@tanstack/react-query";
import {createFileRoute} from "@tanstack/react-router";
import {useNavigate} from "@tanstack/react-router";
import React, {Suspense, useEffect, useState} from "react";
import {ErrorBoundary} from "react-error-boundary";
import {ClientService} from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";
import {LiaProjectDiagramSolid} from "react-icons/lia";

export const Route = createFileRoute("/_layout/clients")({
    component: Clients,
});

function ClientsTableBody({searchTerm, selectedClients, setSelectedClients, allSelected, selectedFilters}) {
    const navigate = useNavigate(); // Hook for navigation
    const toast = useToast(); // Hook for toast notifications
    const {data: clients} = useSuspenseQuery({
        queryKey: ["clients"],
        queryFn: ClientService.getClients,
    });

    const [filteredClients, setFilteredClients] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const clientsPerPage = 20; // Number of clients per page

    useEffect(() => {
        if (clients?.data) {
            let filtered = clients.data.filter(client =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.instagram.toLowerCase().includes(searchTerm.toLowerCase())
            );

            Object.keys(selectedFilters).forEach(filterKey => {
                if (selectedFilters[filterKey].length > 0) {
                    filtered = filtered.filter(client => selectedFilters[filterKey].includes(client[filterKey]));
                }
            });

            setFilteredClients(filtered);
        }
    }, [searchTerm, clients?.data, selectedFilters]); // Check if clients.data is defined before using it

    useEffect(() => {
        if (allSelected) {
            setSelectedClients(filteredClients.map(client => client.id));
        } else {
            setSelectedClients([]);
        }
    }, [allSelected, filteredClients]);

    const handleClientClick = (clientId) => {
        console.log("Client ID clicked: ", clientId);
        navigate({to: `/search?clientId=${clientId}`});
        toast({
            title: "Redirected",
            description: `You have been redirected to the client (${clientId}) relations page.`,
            status: "info",
            duration: 3000,
            isClosable: true,
        });
    };

    const handleImageError = (event) => {
        event.target.onerror = null; // Prevents an infinite loop if the fallback image is also not available
        event.target.src = 'https://via.placeholder.com/150'; // Set to a generic placeholder image URL
    };

    const getOpenForConnectionsText = (value) => {
        switch (value) {
            case 0:
                return 'No';
            case 1:
                return 'Yes';
            case 2:
                return 'Unknown';
            default:
                return 'Unknown';
        }
    };

    const getHowHardToReachText = (value) => {
        switch (value) {
            case 0:
                return 'NA';
            case 1:
                return 'Low';
            case 2:
                return 'Medium';
            case 3:
                return 'High';
            default:
                return 'NA';
        }
    };

    const getPriorityText = (value) => {
        switch (value) {
            case 0:
                return 'NA';
            case 1:
                return 'Low';
            case 2:
                return 'Medium';
            case 3:
                return 'High';
            default:
                return 'NA';
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedClients((prevSelectedClients) => {
            if (prevSelectedClients.includes(id)) {
                return prevSelectedClients.filter(myId => myId !== id);
            } else {
                return [...prevSelectedClients, id];
            }
        });
    };

    // Calculate pagination
    const indexOfLastClient = currentPage * clientsPerPage;
    const indexOfFirstClient = indexOfLastClient - clientsPerPage;
    const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
    const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
            <Tbody>
                {currentClients.map((client) => (
                    <Tr key={client.userId}>
                        <Td>
                            <Checkbox
                                isChecked={selectedClients.includes(client.id)}
                                onChange={() => handleCheckboxChange(client.id)}
                            />
                        </Td>
                        <Td cursor="pointer" onClick={() => handleClientClick(client.userId)}>
                            {client.userId}<LiaProjectDiagramSolid/>
                        </Td>
                        <Td>{client.name}</Td>
                        <Td>{client.nickname}</Td>
                        <Td>
                            {client.instagram ? (
                                <img
                                    src={`http://localhost/api/v1/static/${client.instagram}`}
                                    alt={`${client.name}'s Instagram`}
                                    width="50"
                                    height="50"
                                    onError={handleImageError}
                                />
                            ) : (
                                'Image not available'
                            )}
                        </Td>
                        <Td>{getOpenForConnectionsText(client.openForConnections)}</Td>
                        <Td>{getPriorityText(client.priority)}</Td>
                        <Td>{client.isReached ? "Yes" : "No"}</Td>

                        <Td>{getHowHardToReachText(client.howHardToReach)}</Td>
                        <Td>{client.parameterOne}</Td>
                        <Td>{client.parameterTwo}</Td>
                        <Td>{client.parameterThree}</Td>
                        <Td>{client.groupName}</Td>
                        <Td>
                            <ActionsMenu value={client} type={"Client"}/>
                        </Td>
                    </Tr>
                ))}
            </Tbody>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </>
    );
}

function ClientsTable({searchTerm, selectedClients, setSelectedClients, allSelected}) {
    const [distinctVals, setDistinctVals] = useState({
        groupName: [],
        openForConnections: [],
        priority: [],
        isReached: [],
        howHardToReach: [],
        parameterOne: [],
        parameterTwo: [],
        parameterThree: []
    });
    const [fetchAttempted, setFetchAttempted] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        groupName: [],
        openForConnections: [],
        priority: [],
        isReached: [],
        howHardToReach: [],
        parameterOne: [],
        parameterTwo: [],
        parameterThree: []
    });

    const updateDistinctVals = (clients) => {
        const distinct = {
            groupName: [],
            openForConnections: [],
            priority: [],
            isReached: [],
            howHardToReach: [],
            parameterOne: [],
            parameterTwo: [],
            parameterThree: []
        };

        clients.forEach((client) => {
            Object.keys(distinct).forEach(key => {
                if (!distinct[key].includes(client[key])) distinct[key].push(client[key]);
            });
        });

        setDistinctVals(distinct);
    };

    const handleFilterCheckboxChange = (filterKey, value) => {
        setSelectedFilters((prevSelectedFilters) => {
            if (prevSelectedFilters[filterKey].includes(value)) {
                return {
                    ...prevSelectedFilters,
                    [filterKey]: prevSelectedFilters[filterKey].filter(item => item !== value)
                };
            } else {
                return {
                    ...prevSelectedFilters,
                    [filterKey]: [...prevSelectedFilters[filterKey], value]
                };
            }
        });
    };

    const clearAllFilters = () => {
        setSelectedFilters({
            groupName: [],
            openForConnections: [],
            priority: [],
            isReached: [],
            howHardToReach: [],
            parameterOne: [],
            parameterTwo: [],
            parameterThree: []
        });
    };

    function openFilterMenu(filterKey, displayName) {
        return (
            <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                    {displayName}
                </MenuButton>
                <MenuList>
                    {distinctVals[filterKey].map((value, index) => (
                        <MenuItem key={index} onClick={() => handleFilterCheckboxChange(filterKey, value)}>
                            <Checkbox
                                isChecked={selectedFilters[filterKey].includes(value)}
                            >
                                {value ? value.toString() : ''}
                            </Checkbox>
                        </MenuItem>
                    ))}
                </MenuList>
            </Menu>
        );
    }

    useEffect(() => {
        const allDistinctValsEmpty = Object.values(distinctVals).every(arr => arr.length === 0);

        if (allDistinctValsEmpty && !fetchAttempted) {
            ClientService.getClients().then((response) => {
                updateDistinctVals(response.data);
                setFetchAttempted(true); // Mark fetch as attempted
            });
        }
    }, [distinctVals, fetchAttempted]);

    return (
        <TableContainer>
            <Table size={{base: "sm", md: "md"}}>
                <Thead>
                    <Tr>
                        <Th> </Th>
                        <Th>User ID</Th>
                        <Th>Name</Th>
                        <Th>Username</Th>
                        <Th>Instagram</Th>
                        <Th>{openFilterMenu("openForConnections", "Open for Connections")}</Th>
                        <Th>{openFilterMenu("priority", "Priority")}</Th>
                        <Th>{openFilterMenu("isReached", "Is Reached")}</Th>
                        <Th>{openFilterMenu("howHardToReach", "How Hard to Reach")}</Th>
                        <Th>{openFilterMenu("parameterOne", "Parameter 1")}</Th>
                        <Th>{openFilterMenu("parameterTwo", "Parameter 2")}</Th>
                        <Th>{openFilterMenu("parameterThree", "Parameter 3")}</Th>
                        <Th>{openFilterMenu("groupName", "Group Name")}</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <ErrorBoundary
                    fallbackRender={({error}) => (
                        <Tbody>
                            <Tr>
                                <Td colSpan={14}>Something went wrong: {error.message}</Td>
                            </Tr>
                        </Tbody>
                    )}
                >
                    <Suspense
                        fallback={
                            <Tbody>
                                {new Array(5).fill(null).map((_, index) => (
                                    <Tr key={index}>
                                        {new Array(14).fill(null).map((_, index) => (
                                            <Td key={index}>
                                                <Skeleton height="20px" width="20px"/>
                                            </Td>
                                        ))}
                                    </Tr>
                                ))}
                            </Tbody>
                        }
                    >
                        <ClientsTableBody searchTerm={searchTerm} selectedClients={selectedClients}
                                          setSelectedClients={setSelectedClients} allSelected={allSelected} selectedFilters={selectedFilters}/>
                    </Suspense>
                </ErrorBoundary>
            </Table>
            <Button colorScheme="teal" onClick={clearAllFilters} mt={4}>
                Clear All Filters
            </Button>
        </TableContainer>
    );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
            <Button onClick={handlePrevious} disabled={currentPage === 1} mr={2}>
                Previous
            </Button>
            <span>
                Page {currentPage} of {totalPages}
            </span>
            <Button onClick={handleNext} disabled={currentPage === totalPages} ml={2}>
                Next
            </Button>
        </div>
    );
}

function ErrorFallback({error}) {
    return <div>Something went wrong: {error.message}</div>;
}

function Clients() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClients, setSelectedClients] = useState([]);
    const [allSelected, setAllSelected] = useState(false);
    const toast = useToast();
    const mutation = useMutation({
        mutationFn: async () => {
            await Promise.all(selectedClients.map(clientId => ClientService.deleteClient({clientId})));
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Selected clients have been deleted.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            setSelectedClients([]);
            setAllSelected(false);
            setTimeout(() => {
                window.location.reload();
            }, 500);
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: `Error deleting clients: ${error.message}`,
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
            <Heading size="lg" textAlign={{base: "center", md: "left"}} pt={12}>
                Clients Management
            </Heading>
            <Navbar type={"Client"} onSearch={setSearchTerm}/>
            <Button
                colorScheme="red"
                onClick={handleDeleteSelected}
                isDisabled={selectedClients.length === 0}
                mt={4}
            >
                Delete Selected Clients
            </Button>
            <Button
                colorScheme="blue"
                onClick={handleSelectAll}
                mt={4}
                ml={2}
            >
                {allSelected ? "Deselect All" : "Select All"}
            </Button>
            <Suspense fallback={<Skeleton height="40px" count={5}/>}>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <ClientsTable searchTerm={searchTerm} selectedClients={selectedClients}
                                  setSelectedClients={setSelectedClients} allSelected={allSelected}/>
                </ErrorBoundary>
            </Suspense>
        </Container>
    );
}
