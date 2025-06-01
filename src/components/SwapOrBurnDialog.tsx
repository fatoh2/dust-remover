import {
	AlertDialog,
	Button,
	Flex,
	Text,
} from "@radix-ui/themes";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	count: number;
	target: string;
};

export function SwapOrBurnDialog({
	open,
	onOpenChange,
	onConfirm,
	count,
	target,
}: Props) {
	return (
		<AlertDialog.Root open={open} onOpenChange={onOpenChange}>
			<AlertDialog.Trigger>
				<Button mt="3" color="red" disabled={count === 0}>
					Swap or Burn Selected
				</Button>
			</AlertDialog.Trigger>
			<AlertDialog.Content>
				<AlertDialog.Title>Confirm Action</AlertDialog.Title>
				<AlertDialog.Description>
							You are about to attempt swapping <strong>{count}</strong>{" "}
							selected token type{count > 1 ? "s" : ""} to <strong>{target}</strong>.
							<br />
							If no swap route is found, the token(s) will be <strong>burned</strong>.
							Do you want to continue?
				</AlertDialog.Description>
				<Flex gap="3" mt="4" justify="end">
					<AlertDialog.Cancel>
						<Button variant="soft" color="gray">
							Cancel
						</Button>
					</AlertDialog.Cancel>
					<AlertDialog.Action>
						<Button color="red" onClick={onConfirm}>
							Confirm
						</Button>
					</AlertDialog.Action>
				</Flex>
			</AlertDialog.Content>
		</AlertDialog.Root>
	);
}
