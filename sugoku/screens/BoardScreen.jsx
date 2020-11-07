import { Button, Input, Layout, Text } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import sugokuApi from '../apis/sugokuApi';

// import sudoku from '../dummy-data';
import encodeParams from '../helpers/sugokuEncoder';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 20,
  },
  board: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'row',
    marginBottom: -2,
  },
  box: {
    marginHorizontal: -2,
    fontSize: 16,
    textAlign: 'center',
  },
  submitBtn: {
    marginVertical: 25,
  },
  nameAndDifficulty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 250,
  },
  name: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  difficulty: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  difficultyButton: {
    width: 200,
    marginBottom: 15,
  },
});

const BoardScreen = () => {
  const [sudoku, setSudoku] = useState({ board: [[]] });
  const [board, setBoard] = useState([[]]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSudoku() {
      const result = await sugokuApi({
        url: '/board',
        method: 'GET',
        params: { difficulty: 'easy' },
      });

      setSudoku(result.data);
      setIsLoading(false);
    }
    fetchSudoku();
  }, []);

  useEffect(() => {
    const parsedBoard = JSON.parse(JSON.stringify(sudoku.board));
    setBoard(parsedBoard);
  }, [sudoku]);

  function onBoardChange(row, col, val) {
    const tempBoard = JSON.parse(JSON.stringify(board));
    tempBoard[row][col] = val;
    setBoard(tempBoard);
  }

  async function handleApply() {
    const body = { board };
    const data = encodeParams(body);

    console.log(body);
    console.log(data);

    try {
      const solution = await sugokuApi({
        url: '/validate',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data,
      });

      Alert.alert('Sugoku Validation', solution.data.status);
    } catch (err) {
      console.warn(err);
    }
  }

  async function handleSolveIt() {
    const data = { board };
    const body = encodeParams(data);

    try {
      const solution = await sugokuApi({
        url: '/solve',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      const parsedBoard = JSON.parse(JSON.stringify(solution.data.solution));
      setBoard(parsedBoard);

      Alert.alert('Sugoku Validation', solution.data.status);
    } catch (err) {
      console.warn(err);
    }
  }

  return (
    <Layout style={styles.root}>
      <Layout style={styles.title}>
        <Text>Board</Text>
      </Layout>

      {isLoading ? (
        <Text category="h1">Loading...</Text>
      ) : (
        <>
          <Layout style={styles.board}>
            {board.map((row, rowIdx) => {
              return (
                <Layout style={styles.column} key={rowIdx}>
                  {row.map((col, colIdx) => {
                    const isDisable = sudoku.board[rowIdx][colIdx] !== 0;
                    return (
                      <Input
                        textStyle={styles.box}
                        size="small"
                        disabled={isDisable}
                        value={`${col}`}
                        key={colIdx}
                        onChangeText={(nextValue) => onBoardChange(rowIdx, colIdx, nextValue)}
                      />
                    );
                  })}
                </Layout>
              );
            })}
          </Layout>
          <Layout style={styles.submitBtn}>
            <Button appearance="outline" status="success" onPress={handleApply}>
              {(evaProps) => <Text {...evaProps}>Apply</Text>}
            </Button>
            <Button
              style={{ marginTop: 15 }}
              appearance="outline"
              status="success"
              onPress={handleSolveIt}
            >
              {(evaProps) => <Text {...evaProps}>Just solve it!</Text>}
            </Button>
          </Layout>
        </>
      )}
    </Layout>
  );
};

export default BoardScreen;
