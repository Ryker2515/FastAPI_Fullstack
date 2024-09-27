import {
    Button,
    Flex,
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
import {useForm, SubmitHandler} from "react-hook-form";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {ClientService} from "../../client";
import {ApiError} from "../../client/core/ApiError";
import useCustomToast from "../../hooks/useCustomToast";

interface AddClientProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ClientCreateForm {
    name: string;
    nickname: string;
    instagram: string;
    openForConnections: number;
    isReached: number;
    priority: number;
    userId: number;
    howHardToReach: number;
    parameterOne?: string | null;
    parameterTwo?: string | null;
    parameterThree?: string | null;
    otherRelations: string[];
}

const AddClient = ({isOpen, onClose}: AddClientProps) => {
    const queryClient = useQueryClient();
    const showToast = useCustomToast();

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors, isSubmitting},
    } = useForm<ClientCreateForm>({
        mode: "onBlur",
        defaultValues: {
            // name: "",
            // nickname: "",
            // instagram: "",
            openForConnections: undefined,
            priority: undefined,
            isReached: undefined,
            userId: 0,
            howHardToReach: undefined,
            parameterOne: undefined,
            parameterTwo: undefined,
            parameterThree: undefined,
            otherRelations: undefined,
        },
    });

    const mutation = useMutation({
        mutationFn: (data: ClientCreateForm) =>
            ClientService.createClient({requestBody: data}),
        onSuccess: () => {
            showToast("Success!", "Client created successfully.", "success");
            reset();
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

    const onSubmit: SubmitHandler<ClientCreateForm> = (data) => {

        data.otherRelations = data.otherRelations.split(',').map(str => str.trim());

        if (!data.isReached) {
            data.isReached = 0;
        }


        mutation.mutate(data);
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
                    <ModalHeader>Add Client</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody pb={6}>
                        <FormControl isRequired isInvalid={!!errors.name}>
                            <FormLabel htmlFor="name">Name</FormLabel>
                            <Input
                                id="name"
                                {...register("name", {required: "Name is required"})}
                                placeholder="Name"
                                type="text"
                            />
                            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                        </FormControl>
                        <FormControl mt={4} isRequired isInvalid={!!errors.nickname}>
                            <FormLabel htmlFor="nickname">Nickname</FormLabel>
                            <Input
                                id="nickname"
                                {...register("nickname", {required: "Nickname is required"})}
                                placeholder="Nickname"
                                type="text"
                            />
                            <FormErrorMessage>{errors.nickname?.message}</FormErrorMessage>
                        </FormControl>
                        <FormControl mt={4} isInvalid={!!errors.instagram}>
                            <FormLabel htmlFor="instagram">Instagram</FormLabel>
                            <Input
                                id="instagram"
                                {...register("instagram")}
                                placeholder="Instagram"
                                type="text"
                            />
                            <FormErrorMessage>{errors.instagram?.message}</FormErrorMessage>
                        </FormControl>
                        <FormControl mt={4} isRequired isInvalid={!!errors.priority}>
                            <FormLabel htmlFor="priority">How important to reach?</FormLabel>
                            <Select
                                id="priority"
                                {...register("priority", {required: "How important to reach is required"})}
                                placeholder="- Select priority -"
                            >
                                <option value={1}>1 - Low</option>
                                <option value={2}>2 - Mid</option>
                                <option value={3}>3 - High</option>
                            </Select>
                            <FormErrorMessage>{errors.priority?.message}</FormErrorMessage>
                        </FormControl>
                        <FormControl mt={4} isRequired isInvalid={!!errors.userId}>
                            <FormLabel htmlFor="userId">User ID</FormLabel>
                            <Input
                                id="userId"
                                {...register("userId", {required: "User ID is required"})}
                                placeholder="User ID"
                                type="number"
                            />
                            <FormErrorMessage>{errors.userId?.message}</FormErrorMessage>
                        </FormControl>
                        <FormControl mt={4} isRequired isInvalid={!!errors.howHardToReach}>
                            <FormLabel htmlFor="howHardToReach">How hard to reach?</FormLabel>
                            <Select
                                id="howHardToReach"
                                {...register("howHardToReach", {required: "How hard to reach is required"})}
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
                        <FormControl mt={4}>
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
                        <FormControl mt={4}>
                            <FormLabel htmlFor="otherRelations">Other Relations</FormLabel>
                            <Input
                                id="otherRelations"
                                {...register("otherRelations")}
                                placeholder="Enter comma-separated values"
                                type="string"
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} type="submit" isLoading={isSubmitting}>
                            Save
                        </Button>
                        <Button onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default AddClient;
