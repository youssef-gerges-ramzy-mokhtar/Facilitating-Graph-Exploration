# Facilitating-Graph-Exploration
![image](https://github.com/user-attachments/assets/7bd913c6-f449-44e4-b8d6-391ba5f18be8)

## Website Link
You can access the project website through the following link: https://facilitating-graph-exploration.web.app/

## Description
This is my final year project, and it aims to create a website that displays visually good-looking graphs and offers multiple graph algorithm visualizers. The following functionalities are provided:
- Users can input graphs as edge lists, which are then visually displayed
- Toggle between viewing directed and undirected versions of the graph
- Allowing visualization of the following graph algorithms on the user-inputted graph:
  - Depth-First Search (DFS)
  - Breadth-First Search (BFS)
  - Dijkstra's Shortest Path
- Adjust the speed of the algorithm visualizations
- View the trace of algorithm execution as it runs

## How to run the project
- install liver-server using npm <br/>
  ```npm i live-server```
- clone this repo into your local machine and navigate to "4. Implementation" <br/>
  ```cd "Facilitating-Graph-Exploration/4. Implementation"```
- start the local server <br/>
  ```live-server```
- open your browser and go to ```http://localhost:8080/```

> [!NOTE]
> We use a local server to prevent CORS erros, as the JavaScript code is defined across multiple files

> [!TIP]
> You can use an alternative local server package instead of ```live-server``` if you're familiar with it. However, ensure you can run the code without issues on your chosen tool.
