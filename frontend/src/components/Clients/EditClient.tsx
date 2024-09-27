import React from "react";
import {
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay, Select,
} from "@chakra-ui/react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {SubmitHandler, useForm} from "react-hook-form";

import {
    ApiError,
    ClientPublic,
    ClientUpdate,
    ClientService,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface EditClientProps {
    client: ClientPublic;
    isOpen: boolean;
    onClose: () => void;
}

const EditClient = ({client, isOpen, onClose}: EditClientProps) => {
    const queryClient = useQueryClient();
    const showToast = useCustomToast();
    const {
        register,
        handleSubmit,
        reset,
        formState: {isSubmitting, errors, isDirty},
    } = useForm<ClientUpdate>({
        mode: "onBlur",
        defaultValues: client,
    });

    const mutation = useMutation({
        mutationFn: (data: ClientUpdate) =>
            ClientService.patchClient(client.id, data)
        ,
        onSuccess: () => {
            showToast("Success!", "Client updated successfully.", "success");
            onClose();
        },
        onError: (err: ApiError) => {
            const errDetail = (err.body as any)?.detail;
            showToast("Something went wrong.", `${errDetail}`, "error");
        },
        onSettled: () => {
            queryClient.invalidateQueries({queryKey: ["clients"]});
        },
    });

    const onSubmit: SubmitHandler<ClientUpdate> = async (data:ClientUpdate) => {
        mutation.mutate(data);
    };

    const onCancel = () => {
        reset();
        onClose();
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size={{base: "sm", md: "md"}}
                isCentered
            >
                <ModalOverlay/>
                <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
                    <ModalHeader>Edit Client</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody pb={6}>
                        <FormControl isRequired isInvalid={!!errors.name}>
                            <FormLabel htmlFor="name">Name</FormLabel>
                            <Input
                                id="name"
                                {...register("name")}
                                type="text"
                            />
                            {errors.name && (
                                <FormErrorMessage>{errors.name.message}</FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl isRequired mt={4}>
                            <FormLabel htmlFor="nickname">Nickname</FormLabel>
                            <Input
                                id="nickname"
                                {...register("nickname")}
                                placeholder="Nickname"
                                type="text"
                            />
                        </FormControl>
                        <FormControl mt={4}>
                            <FormLabel htmlFor="instagram">Instagram</FormLabel>
                            <Input
                                id="instagram"
                                {...register("instagram")}
                                placeholder="Instagram"
                                type="text"
                            />
                        </FormControl>
                        <FormControl mt={4} isRequired isInvalid={!!errors.priority}>
                            <FormLabel htmlFor="priority">How important to reach?</FormLabel>
                            <Select
                                id="priority"
                                {...register("priority")}
                                placeholder="- Select priority -"
                            >
                                <option value={1}>1 - Low</option>
                                <option value={2}>2 - Mid</option>
                                <option value={3}>3 - High</option>
                            </Select>
                            <FormErrorMessage>{errors.priority?.message}</FormErrorMessage>
                        </FormControl>
                        <FormControl isRequired mt={4} isInvalid={!!errors.howHardToReach}>
                            <FormLabel htmlFor="howHardToReach">How hard to reach?</FormLabel>
                            <Select
                                id="howHardToReach"
                                {...register("howHardToReach")}
                                placeholder="- Select difficulty -"
                            >
                                <option value={1}>1 - Low</option>
                                <option value={2}>2 - Mid</option>
                                <option value={3}>3 - High</option>
                            </Select>
                            <FormErrorMessage>{errors.howHardToReach?.message}</FormErrorMessage>
                        </FormControl>
                        <FormControl mt={4} isInvalid={!!errors.parameterOne}>
                            <FormLabel htmlFor="parameterOne">Parameter 1</FormLabel>
                            <Input
                                id="parameterOne"
                                {...register("parameterOne")}
                                placeholder="Parameter 1"
                                type="text"
                            />
                            <FormErrorMessage>{errors.parameterOne?.message}</FormErrorMessage>
                        </FormControl>
                        <FormControl mt={4} isInvalid={!!errors.parameterTwo}>
                            <FormLabel htmlFor="parameterTwo">Parameter 2</FormLabel>
                            <Input
                                id="parameterTwo"
                                {...register("parameterTwo")}
                                placeholder="Parameter 2"
                                type="text"
                            />
                            <FormErrorMessage>{errors.parameterTwo?.message}</FormErrorMessage>
                        </FormControl>
                        <FormControl mt={4} isInvalid={!!errors.parameterThree}>
                            <FormLabel htmlFor="parameterThree">Parameter 3</FormLabel>
                            <Input
                                id="parameterThree"
                                {...register("parameterThree")}
                                placeholder="Parameter 3"
                                type="text"
                            />
                            <FormErrorMessage>{errors.parameterThree?.message}</FormErrorMessage>
                        </FormControl>
                        <FormControl mt={4} isRequired isInvalid={!!errors.openForConnections}>
                            <FormLabel htmlFor="openForConnections">Open for Connections</FormLabel>
                            <Select
                                id="openForConnections"
                                {...register("openForConnections")}
                                placeholder="- Select openness -"
                            >
                                <option value={0}>0 - NO</option>
                                <option value={1}>1 - YES</option>
                                <option value={2}>2 - UNKNOWN</option>
                            </Select>
                            <FormErrorMessage>{errors.openForConnections?.message}</FormErrorMessage>
                        </FormControl>
                        <FormControl isRequired mt={4}>
                            <FormLabel htmlFor="isReached">Is reached already?</FormLabel>
                            <Select
                                id="isReached"
                                {...register("isReached")}
                                placeholder="- Select if reached -"
                            >
                                <option value={0}>0 - NO</option>
                                <option value={1}>1 - YES</option>
                            </Select>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter gap={3}>
                        <Button
                            variant="primary"
                            type="submit"
                            isLoading={isSubmitting}
                            isDisabled={!isDirty}
                        >
                            Save
                        </Button>
                        <Button onClick={onCancel}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default EditClient;
