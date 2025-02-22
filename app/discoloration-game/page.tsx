'use client'
import { Span } from "next/dist/trace";
import { useEffect, useState } from "react";

function validCell(i: number, j: number, n: number) {
	if (i < 0 || j < 0 || i >= n || j >= n) return false;
	return true;
}
function toggleColor(currColor: number) {
	if (currColor == 0) return 1;
	return 0;
}
function generateCoordinates(i: number, j: number) {
	const coordinatesArray = [
		[i, j],
		[i - 1, j],
		[i + 1, j],
		[i, j - 1],
		[i, j + 1]
	];
	return coordinatesArray;
}
function checkWin(gameArray: number[][], n: number) {
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			if (gameArray[i][j] == 0) return false;
		}
	}
	return true;
}

const DiscolorationGame = () => {
	const [level, setLevel] = useState<number>(2);
	const [gameArray, setGameArray] = useState(Array.from({ length: level }, () => Array(level).fill(0)));
	const [won, setWon] = useState(false);
	const [moves, setMoves] = useState<number[][]>([]);
	useEffect(() => {
		setGameArray(Array.from({ length: level }, () => Array(level).fill(0)));
	}, [level]);
	const handleCellClick = (e: any) => {
		if(won) return;
		const row = Number(e.target.dataset.row);
		const col = Number(e.target.dataset.col);
		setMoves((prev) => {
			let tempMoves = structuredClone(prev);
			tempMoves.push([row, col]);
			return tempMoves;
		})
		const tempGameArray = structuredClone(gameArray);
		const coordinatesArray = generateCoordinates(row, col);
		coordinatesArray.map((coord) => {
			if (validCell(coord[0], coord[1], level)) {
				tempGameArray[coord[0]][coord[1]] = toggleColor(gameArray[coord[0]][coord[1]]);
			}
		})
		setGameArray(tempGameArray);
		if (checkWin(tempGameArray, level)) {
			setWon(true);
		}
	}
	return (
		<div className="flex flex-col justify-center">
			<h1 className="text-center">Discoloration Game</h1>
			<div
				className={`grid justify-center gap-2`}
				style={{ gridTemplateColumns: `repeat(${level}, 50px)` }}
				onClick={handleCellClick}
			>
				{
					gameArray.map((row, rowId) =>
						row.map((col, colId) =>
							<div
								className={`h-[50px] border border-black ${col == 1 ? "bg-yellow-400" : ""}`}
								key={colId}
								data-row={rowId}
								data-col={colId}
							/>)
					)
				}
			</div>
			<div className="text-center">
				Moves: {moves.map((row, idx) => <span key={idx}>{row[0]}{","}{row[1]}{idx == (moves.length - 1) ? " " : " | "}</span>)}
			</div>
			<div className="flex justify-center gap-5 mt-5">
				<button className="bg-green-600 p-2 text-white"
					onClick={
						() => {setLevel(prev => {
							if (prev <= 2) return prev;
							return prev - 1;
						});
						setMoves([]);
						setWon(false);
					}}>Previous</button>
				<button className="bg-green-600 p-2 text-white"
					onClick={
						() => {setLevel(prev => {
							if (prev >= 8) return prev;
							return prev + 1;
						});
						setWon(false);
						setMoves([]);
					}}>Next</button>
				<button className="bg-blue-600 p-2 text-white"
					onClick={() => {
						setGameArray(Array.from({ length: level }, () => Array(level).fill(0)));
						setWon(false);
						setMoves([]);
					}}>Reset</button>
				<div>
					<label htmlFor="jumpToInput">Jump to level: </label>
					<form
						onSubmit={(e) => {
							e.preventDefault(); // Prevent page refresh
							const inputValue = (e.currentTarget.elements.namedItem("jumpToInput") as HTMLInputElement).value;
							const newLevel = parseInt(inputValue, 10);
							if (newLevel >= 2 && newLevel <= 8) {
								setWon(false);
								setLevel(newLevel);
							} else {
								alert("Please enter a level between 2 and 6.");
							}
						}}
					>
						<input
							id="jumpToInput"
							name="jumpToInput"
							type="number"
							min="2"
							max="6"
							placeholder="Enter level (2-6)"
							aria-describedby="jumpToHelperText"
							style={{ width: "150px" }}
						/>
					</form>
				</div>
			</div>
		</div>
	);
};

export default DiscolorationGame;
