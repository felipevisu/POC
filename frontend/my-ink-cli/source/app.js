#!/usr/bin/env node
import React, {useState, useEffect} from 'react';
import {render, Box, Text, useInput, useApp, Newline, Spacer} from 'ink';
import Spinner from 'ink-spinner';
import Gradient from 'ink-gradient';
import BigText from 'ink-big-text';

// Custom TextInput Component for Ink v4
const TextInput = ({
	value = '',
	onChange,
	onSubmit,
	placeholder = '',
	isPassword = false,
	focus = true,
}) => {
	const [cursor, setCursor] = useState(value.length);
	const [showCursor, setShowCursor] = useState(true);

	useEffect(() => {
		const timer = setInterval(() => {
			setShowCursor(prev => !prev);
		}, 530);
		return () => clearInterval(timer);
	}, []);

	useInput((input, key) => {
		if (!focus) return;

		if (key.return) {
			onSubmit?.(value);
		} else if (key.backspace || key.delete) {
			if (cursor > 0) {
				onChange(value.slice(0, cursor - 1) + value.slice(cursor));
				setCursor(cursor - 1);
			}
		} else if (key.leftArrow) {
			setCursor(Math.max(0, cursor - 1));
		} else if (key.rightArrow) {
			setCursor(Math.min(value.length, cursor + 1));
		} else if (input && !key.ctrl && !key.meta) {
			onChange(value.slice(0, cursor) + input + value.slice(cursor));
			setCursor(cursor + input.length);
		}
	});

	const display = isPassword ? '•'.repeat(value.length) : value;

	return (
		<Box>
			<Text>
				{display.slice(0, cursor)}
				{showCursor && <Text inverse> </Text>}
				{display.slice(cursor)}
				{!value && placeholder && <Text dimColor> {placeholder}</Text>}
			</Text>
		</Box>
	);
};

// Custom Select Component for Ink v4
const Select = ({items = [], onSelect, focus = true}) => {
	const [selected, setSelected] = useState(0);

	useInput((input, key) => {
		if (!focus) return;

		if (key.upArrow) {
			setSelected(prev => (prev > 0 ? prev - 1 : items.length - 1));
		} else if (key.downArrow) {
			setSelected(prev => (prev < items.length - 1 ? prev + 1 : 0));
		} else if (key.return) {
			onSelect?.(items[selected]);
		}
	});

	return (
		<Box flexDirection="column">
			{items.map((item, i) => (
				<Box key={i}>
					<Text color={i === selected ? 'cyan' : undefined}>
						{i === selected ? '❯ ' : '  '}
						{item.label}
					</Text>
					{item.desc && <Text dimColor> - {item.desc}</Text>}
				</Box>
			))}
		</Box>
	);
};

// Status Badge Component
const Badge = ({type, text}) => {
	const colors = {
		success: 'green',
		error: 'red',
		warning: 'yellow',
		info: 'blue',
	};

	return (
		<Box paddingX={1}>
			<Text backgroundColor={colors[type] || 'gray'} color="white">
				{' ' + text + ' '}
			</Text>
		</Box>
	);
};

// Main App
const App = () => {
	const {exit} = useApp();
	const [screen, setScreen] = useState('menu');
	const [loading, setLoading] = useState(false);
	const [apiKey, setApiKey] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [notification, setNotification] = useState(null);

	// Mock data
	const cryptoData = [
		{symbol: 'BTC', name: 'Bitcoin', price: 67432, change: 2.4},
		{symbol: 'ETH', name: 'Ethereum', price: 3456, change: -1.2},
		{symbol: 'SOL', name: 'Solana', price: 145, change: 8.7},
		{symbol: 'AVAX', name: 'Avalanche', price: 38, change: 4.2},
		{symbol: 'DOT', name: 'Polkadot', price: 7.8, change: -0.5},
	];

	// Handle ESC key globally
	useInput((input, key) => {
		if (key.escape && screen !== 'menu') {
			setScreen('menu');
		}
		if (key.ctrl && input === 'c') {
			exit();
		}
	});

	// Menu Screen
	if (screen === 'menu') {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Gradient name="rainbow">
					<BigText text="CRYPTO" font="chrome" />
				</Gradient>

				<Box marginBottom={1}>
					<Text bold>Terminal Trading Interface v1.0</Text>
				</Box>

				<Select
					items={[
						{label: '📊 View Prices', value: 'prices'},
						{label: '🔍 Search Crypto', value: 'search'},
						{label: '🔑 API Settings', value: 'api'},
						{label: '📈 Portfolio', value: 'portfolio'},
						{label: '⚡ Quick Trade', value: 'trade'},
						{label: '🚪 Exit', value: 'exit'},
					]}
					onSelect={item => {
						if (item.value === 'exit') exit();
						else setScreen(item.value);
					}}
				/>

				<Box marginTop={1}>
					<Text dimColor>Use ↑↓ arrows to navigate, Enter to select</Text>
				</Box>
			</Box>
		);
	}

	// Prices Screen
	if (screen === 'prices') {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Box marginBottom={1}>
					<Text bold color="cyan">
						📊 Live Crypto Prices
					</Text>
					<Spacer />
					<Badge type="success" text="CONNECTED" />
				</Box>

				<Box marginBottom={1}>
					<Box width={12}>
						<Text bold>Symbol</Text>
					</Box>
					<Box width={20}>
						<Text bold>Name</Text>
					</Box>
					<Box width={15}>
						<Text bold>Price</Text>
					</Box>
					<Box width={10}>
						<Text bold>24h %</Text>
					</Box>
				</Box>

				<Box flexDirection="column">
					{cryptoData.map((crypto, i) => (
						<Box key={i}>
							<Box width={12}>
								<Text color="yellow">{crypto.symbol}</Text>
							</Box>
							<Box width={20}>
								<Text>{crypto.name}</Text>
							</Box>
							<Box width={15}>
								<Text>${crypto.price.toLocaleString()}</Text>
							</Box>
							<Box width={10}>
								<Text color={crypto.change > 0 ? 'green' : 'red'}>
									{crypto.change > 0 ? '+' : ''}
									{crypto.change}%
								</Text>
							</Box>
						</Box>
					))}
				</Box>

				<Box marginTop={2}>
					<Text dimColor>Press ESC to return to menu • Press R to refresh</Text>
				</Box>
			</Box>
		);
	}

	// Search Screen
	if (screen === 'search') {
		const filtered = cryptoData.filter(
			c =>
				c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
		);

		return (
			<Box flexDirection="column" paddingY={1}>
				<Text bold color="cyan">
					🔍 Search Cryptocurrency
				</Text>

				<Box marginY={1}>
					<Text>Search: </Text>
					<TextInput
						value={searchTerm}
						onChange={setSearchTerm}
						placeholder="Enter symbol or name..."
						onSubmit={() => {}}
					/>
				</Box>

				{searchTerm && (
					<Box flexDirection="column" marginTop={1}>
						<Text dimColor>Results ({filtered.length} found):</Text>
						{filtered.map((crypto, i) => (
							<Box key={i} marginTop={1}>
								<Text color="yellow">{crypto.symbol}</Text>
								<Text> - {crypto.name} - </Text>
								<Text bold>${crypto.price}</Text>
							</Box>
						))}
					</Box>
				)}

				<Box marginTop={2}>
					<Text dimColor>Press ESC to return</Text>
				</Box>
			</Box>
		);
	}

	// API Settings Screen
	if (screen === 'api') {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Text bold color="cyan">
					🔑 API Configuration
				</Text>

				<Box marginY={1} flexDirection="column">
					<Text>Enter your API key:</Text>
					<Box marginTop={1}>
						<TextInput
							value={apiKey}
							onChange={setApiKey}
							isPassword={true}
							placeholder="sk-..."
							onSubmit={() => {
								setNotification('API Key saved!');
								setTimeout(() => {
									setNotification(null);
									setScreen('menu');
								}, 2000);
							}}
						/>
					</Box>
				</Box>

				{notification && (
					<Box marginTop={1}>
						<Badge type="success" text={notification} />
					</Box>
				)}

				<Box marginTop={2}>
					<Text dimColor>Press Enter to save • ESC to cancel</Text>
				</Box>
			</Box>
		);
	}

	// Portfolio Screen
	if (screen === 'portfolio') {
		if (loading) {
			return (
				<Box paddingY={1}>
					<Spinner type="dots" />
					<Text> Loading portfolio...</Text>
				</Box>
			);
		}

		return (
			<Box flexDirection="column" paddingY={1}>
				<Text bold color="cyan">
					📈 Your Portfolio
				</Text>

				<Box marginTop={2} flexDirection="column">
					<Box>
						<Text>Total Value: </Text>
						<Text bold color="green">
							$125,430.50
						</Text>
					</Box>
					<Box>
						<Text>24h Change: </Text>
						<Text bold color="green">
							+$3,245.20 (+2.66%)
						</Text>
					</Box>
				</Box>

				<Box marginTop={2} flexDirection="column">
					<Text dimColor>Holdings:</Text>
					<Box marginTop={1}>
						<Box width={10}>
							<Text>2.5 BTC</Text>
						</Box>
						<Text> = $168,580</Text>
					</Box>
					<Box>
						<Box width={10}>
							<Text>15 ETH</Text>
						</Box>
						<Text> = $51,840</Text>
					</Box>
					<Box>
						<Box width={10}>
							<Text>500 SOL</Text>
						</Box>
						<Text> = $72,500</Text>
					</Box>
				</Box>

				<Box marginTop={2}>
					<Text dimColor>Press ESC to return</Text>
				</Box>
			</Box>
		);
	}

	// Trade Screen
	if (screen === 'trade') {
		const [tradeType, setTradeType] = useState('buy');
		const [amount, setAmount] = useState('');
		const [symbol, setSymbol] = useState('');

		return (
			<Box flexDirection="column" paddingY={1}>
				<Text bold color="cyan">
					⚡ Quick Trade
				</Text>

				<Box marginY={1} flexDirection="column" gap={1}>
					<Box>
						<Text>Type: </Text>
						<Select
							items={[
								{label: 'Buy', value: 'buy'},
								{label: 'Sell', value: 'sell'},
							]}
							onSelect={item => setTradeType(item.value)}
							focus={!amount && !symbol}
						/>
					</Box>

					<Box>
						<Text>Symbol: </Text>
						<TextInput
							value={symbol}
							onChange={setSymbol}
							placeholder="BTC"
							focus={symbol !== '' || (!amount && tradeType)}
							onSubmit={() => {}}
						/>
					</Box>

					<Box>
						<Text>Amount: </Text>
						<TextInput
							value={amount}
							onChange={setAmount}
							placeholder="0.00"
							focus={amount !== '' || symbol}
							onSubmit={() => {
								setLoading(true);
								setTimeout(() => {
									setLoading(false);
									setScreen('menu');
								}, 2000);
							}}
						/>
					</Box>
				</Box>

				{loading && (
					<Box>
						<Spinner />
						<Text> Processing trade...</Text>
					</Box>
				)}

				<Box marginTop={2}>
					<Text dimColor>Press Enter to execute • ESC to cancel</Text>
				</Box>
			</Box>
		);
	}

	return null;
};

export default App;

// Run the app
render(<App />);
