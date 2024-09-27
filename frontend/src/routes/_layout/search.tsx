import React, {useEffect, useState} from "react";
import {request as __request} from '../../client/core/request';
import {OpenAPI} from '../../client';
import {Graph} from 'react-d3-graph';
import {
    Box,
    Heading,
    Button,
    Input,
    useToast,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    Modal, ModalCloseButton, ModalFooter, useDisclosure
} from "@chakra-ui/react";
import {useNavigate} from "@tanstack/react-router";

const CircleGraph = () => {
    const [relations, setRelations] = useState([]);
    const [clientData, setClientData] = useState(null);
    const [error, setError] = useState(null);
    // let [inputClientId, setInputClientId] = useState("");
    const [clientId, setClientId] = useState(new URLSearchParams(window.location.search).get('clientId'));
    const {isOpen, onOpen, onClose} = useDisclosure();
    let inputClientId = "";

    const NoClientId = ({error}) => {
        const navigate = useNavigate();
        const toast = useToast();

        const goToClientsPage = () => {
            navigate({to: '/clients'});
            toast({
                title: "Redirected",
                description: "You have been redirected to the clients page.",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
        };

        const handleInputChange = (e) => {
            // setInputClientId(e.target.value);
            inputClientId = e.target.value;
            console.log(inputClientId)
        };

        const handleSubmit = () => {
            setClientId(inputClientId);
        };
        return (
            <Box p={5} maxW="lg" borderWidth="1px" borderRadius="lg" overflow="hidden" textAlign="center">
                <Heading
                    mb={4}>{error ? "Client not found. Please enter a valid client ID" : "Enter client ID"}</Heading>
                <Input
                    // value={inputClientId}
                    onChange={handleInputChange}
                    placeholder="Enter client ID"
                    mb={4}
                />
                <Button colorScheme="teal" onClick={handleSubmit}>Submit</Button>
                <Button colorScheme="teal" onClick={goToClientsPage} mt={4}>Go to clients page</Button>
            </Box>
        );
    };

    useEffect(() => {
        if (clientId) {
            const fetchData = async () => {
                try {
                    const response = await __request(OpenAPI, {
                        method: 'GET',
                        url: `/api/v1/clients/${clientId}/relations`,
                        mediaType: 'application/json',
                        errors: {
                            404: `Not Found`,
                            422: `Validation Error`,
                        },
                    });
                    if (response.data) {
                        setRelations(response.data);
                    } else {
                        setRelations(response);
                    }
                    setError(null); // Clear any previous error
                } catch (error) {
                    if (error.status === 404) {
                        setError("Client not found. Please enter a valid client ID.");
                    } else {
                        setError(error.message);
                    }
                }
            };

            fetchData();
        }
    }, [clientId]);

    if (!clientId || error) {
        return <NoClientId error={error}/>;
    }

    if (error) {
        return <div>Error fetching data: {error}</div>;
    }

    const fetchClientData = async (nodeId) => {
        try {
            const response = await __request(OpenAPI, {
                method: 'GET',
                url: `/api/v1/clients/${nodeId}`,
                mediaType: 'application/json',
                errors: {
                    422: `Validation Error`,
                },
            });
            setClientData(response);
            onOpen();
        } catch (error) {
            setError(error.message);
        }
    };

    const nodeClicked = (nodeId) => {
        fetchClientData(nodeId);
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

    // Function to convert relations data to graph nodes and links
    const convertToGraphData = () => {
        const nodes = [];
        const links = [];
        if (!Array.isArray(relations) && clientId) {
            console.log(relations)
            // If there are no relations, add a single node for the client
            nodes.push({
                id: clientId,
                label: relations.name,
                // color: 'white',
                svg: `http://localhost/api/v1/static/${relations.instagram}`,
                // strokeColor: 'orange',
                // strokeWidth: 5,
                size: 500,
                fontSize: 14,
                // renderLabel: true,
                labelProperty: 'label',
                labelPosition: 'bottom',
            });
        } else {
            relations.forEach(relation => {
                const fromNode = {
                    id: relation.fromClientId,
                    label: relation.from_client_name,
                    // color: 'white',
                    // strokeColor: 'orange',
                    // strokeWidth: 5,
                    symbolType: 'circle',
                    size: 500,
                    fontSize: 14,
                    // renderLabel: true,
                    labelProperty: 'label',
                    svg: `http://localhost/api/v1/static/${relation.fromClientInstagram}`,
                    labelPosition: 'bottom',
                };
                const toNode = {
                    id: relation.toClientId,
                    label: relation.to_client_name,
                    // color: 'white',
                    // strokeColor: 'lightblue',
                    // strokeWidth: 5,
                    symbolType: 'circle',
                    size: 500,
                    fontSize: 14,
                    // fontWeight: 'bold',
                    // renderLabel: true,
                    svg: `http://localhost/api/v1/static/${relation.toClientInstagram}`,
                    labelProperty: 'label',
                    labelPosition: 'bottom',
                };

                if (!nodes.find(node => node.id === fromNode.id)) {
                    nodes.push(fromNode);
                }
                if (!nodes.find(node => node.id === toNode.id)) {
                    nodes.push(toNode);
                }

                links.unshift({
                    source: fromNode.id,
                    target: toNode.id,
                });

                if (relation.relations) {
                    relation.relations.forEach(subRelation => {
                        const subFromNode = {
                            id: subRelation.fromClientId,
                            label: subRelation.from_client_name,
                            size: 500,
                            svg: `http://localhost/api/v1/static/${subRelation.fromClientInstagram}`,
                            fontSize: 14,
                            labelPosition: 'bottom',
                            labelProperty: 'label',
                            symbolType: 'circle',
                        };
                        const subToNode = {
                            id: subRelation.toClientId,
                            label: subRelation.to_client_name,
                            // color: 'white',
                            // strokeColor: 'pink',
                            // strokeWidth: 5,
                            size: 500,
                            svg: `http://localhost/api/v1/static/${subRelation.toClientInstagram}`,
                            fontSize: 14,
                            // fontWeight: 'bold',
                            labelPosition: 'bottom',
                            labelProperty: 'label',
                            symbolType: 'circle',
                        };

                        if (!nodes.find(node => node.id === subToNode.id)) {
                            nodes.push(subToNode);
                        }
                        if (!nodes.find(node => node.id === subFromNode.id)) {
                            nodes.push(subFromNode);
                        }

                        links.unshift({
                            source: subFromNode.id,
                            target: subToNode.id,
                            color: "#3eef19"
                        });
                    });
                }
            });
        }

        console.log(links)
        console.log(nodes)
        return {
            nodes,
            links,
        };
    };

    const graphData = convertToGraphData();

    // Graph configuration
    const myConfig = {
        nodeHighlightBehavior: true,
        node: {
            // color: "lightgray",
            size: 4500,
            highlightStrokeColor: "blue",
            renderLabel: true,
            labelProperty: 'label',
            symbolType: 'circle',
        },
        link: {
            highlightColor: "lightblue",
            strokeWidth: 3,
            color: "#0928f1"

        },
        directed: true,
        d3: {
            gravity: -1000,
        },
        width: 5000,
        height: 2500,
    };

    return (
        <div style={{height: '100vh', width: '100vw'}}>
            <Graph
                id="graph-id"
                data={graphData}
                config={myConfig}
                onClickNode={nodeClicked}
            />
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Client Details</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        {clientData ? (
                            <div>
                                <p>Name: {clientData.name}</p>
                                <p>Username: {clientData.nickname}</p>
                                {/*<p>Instagram: <a href={clientData.instagram}>{clientData.instagram}</a></p>*/}
                                {clientData.instagram ? (
                                    <img
                                        src={clientData.instagram}
                                        alt={`${clientData.name}'s Instagram`}
                                        width="50"
                                        height="50"
                                        onError={(e) => {
                                            e.target.onerror = null; // Prevents an infinite loop if the fallback image is also not available
                                            e.target.src = 'https://via.placeholder.com/150';
                                        }}
                                    />
                                ) : (
                                    'Image not available'
                                )}
                                <p>Open for Connections: {getOpenForConnectionsText(clientData.openForConnections)}</p>
                                <p>Priority: {clientData.priority}</p>
                                <p>Is Reached: {clientData.isReached ? "Yes" : "No"}</p>
                                <p>Status: {clientData.status}</p>
                                <p>User ID: {clientData.userId}</p>
                                <p>How Hard to Reach: {clientData.howHardToReach}</p>
                                <p>Parameter One: {clientData.parameterOne}</p>
                                <p>Parameter Two: {clientData.parameterTwo}</p>
                                <p>Parameter Three: {clientData.parameterThree}</p>
                            </div>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default CircleGraph;

// Now you can use the CircleGraph component in your Route definition
import {createFileRoute} from "@tanstack/react-router";
import {ApiResult} from "../../client/core/ApiResult.ts";

export const Route = createFileRoute("/_layout/search")({
    component: CircleGraph,
});
