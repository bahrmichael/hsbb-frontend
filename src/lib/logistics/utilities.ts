export function countDays(date: Date): number {
	const today = new Date();
	const timeDiff = Math.abs(today.getTime() - new Date(date).getTime());
	return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

export function mapTransactionType(transactionType: string) {
	switch (transactionType) {
		case 'contractOut':
			return 'Contract accepted';
		case 'contractIn':
			return 'Contract returned';
		case 'reward':
			return 'Reward';
		case 'payout':
			return 'Payout';
		case 'collateralTransfer':
			return 'Collateral cleared';
		default:
			return transactionType;
	}
}

export function atLeast7Days(item: { updated: Date }) {
	return countDays(item.updated) >= 7;
}

export function exportToCsv() {
	alert('This is not implemented yet. Just ping Lerso on Discord.');
}

export function getDaysClass(days: number) {
	if (days >= 14) return 'text-red-600 font-semibold';
	if (days >= 7) return 'text-yellow-600 font-semibold';
	return 'text-green-600 font-semibold';
}