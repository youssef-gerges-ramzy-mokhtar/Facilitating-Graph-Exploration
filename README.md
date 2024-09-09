# Facilitating-Graph-Exploration

## Table of Contents
1. [Project Overview](#project-overview)
2. [Website Link](#website-link)
3. [Description](#description)
4. [Running the Project](#running-the-project)
5. [Using the Project](#using-the-project)
    - [Website Overview](#website-overview)
    - [Running the Algorithm Visualizer](#running-the-algorithm-visualizer)
    - [Additional Notes](#additional-notes)
6. [Final Remarks](#final-remarks)

## Project Overview
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

## Running the Project
- install liver-server using npm <br/>
  ```npm i live-server```
- clone this repo into your local machine and navigate to "4.implementation" <br/>
  ```cd "Facilitating-Graph-Exploration/4.implementation"```
- start the local server <br/>
  ```live-server```
- open your browser and go to ```http://localhost:8080/```

> [!NOTE]
> We use a local server to prevent CORS erros, as the JavaScript code is defined across multiple files

> [!TIP]
> You can use an alternative local server package instead of ```live-server``` if you're familiar with it. However, ensure you can run the code without issues on your chosen tool.

## Using the Project
### Website Overview
![website-overview](https://github.com/user-attachments/assets/93d888d7-1264-4027-a7d6-2115a3c0181b)

<ol><li><p><strong>Graph Input</strong><br>Enter your graph data in the text area. Each line should be formatted as <code>(u, v, w)</code>, where <code>u</code> and <code>v</code> are nodes and <code>w</code> is the weight of the edge from <code>u</code> to <code>v</code>. If the weight <code>w</code> is not specified, it defaults to zero.</p></li><li><p><strong>Graph Type</strong><br>Choose whether to display the graph as directed or undirected.</p></li><li><p><strong>Algorithm Visualizer</strong><br>Select the algorithm you want to visualize on the graph.</p></li><li><p><strong>Drawing Area</strong><br>This is where the graph and algorithm visualization steps are displayed.</p></li><li><p><strong>Algorithm Visualization Speed</strong><br>Use the slider to adjust the speed of the algorithm visualization.</p></li><li><p><strong>Visualization Options</strong></p><ul><li><strong>Stop Drawing</strong>: Stops the graph from being drawn.</li><li><strong>Stop Visualizer</strong>: Halts the algorithm visualization.</li><li><strong>Clear Algorithm Steps</strong>: Clears the area showing algorithm steps.</li></ul></li><li><p><strong>Algorithm Steps</strong><br>Shows the execution steps of the algorithm as it runs.</p></li></ol>

### Running the Algorithm Visualizer
To run an algorithm visualizer on the graph, click on any of the graph nodes. This node will be used as the starting point for the algorithm. <br/>
Below is an example of running DFS on the graph starting at node 1:
![algorithm-overview](https://github.com/user-attachments/assets/41eb6b76-4f14-4c9d-9ef6-c8b32bd5a813)

### Additional Notes
- While there is an option to display undirected graphs, it is important to note that when running the algorithm visualizers, they operate on the directed graph version inputted by the user
- Nodes can be labeled with text, as shown below:
  ![graph-text-overview](https://github.com/user-attachments/assets/d014d2a1-bf71-475f-aaf2-e726170e4e2b)

## Final Remarks
- For more in-depth information about the project, please refer to the [project thesis](https://github.com/youssef-gerges-ramzy-mokhtar/Facilitating-Graph-Exploration/blob/main/5.report/report.pdf)
- I would also like to extend my sincere thanks to Dr. Marco for his guidance and support as my supervisor throughout this project
