function buildMetadata(sample) {
  // Build metadata panel from selected sample
  var url = `/metadata/${sample}`;
  console.log(`Fetching results for sample ${sample} from ${url}`);
  d3.json(url).then(function(data){
    console.log("Metadata Details")
    console.log(data);
    var metaData = d3.select("#sample-metadata");
    // Clear existing metadata
    metaData.html("");
    // Add each key and value pair to panel
    var dataItems = Object.entries(data);
    dataItems.forEach(function(item) {
      var key = item[0];
      var value = item[1];
      metaData
      .append("h6")
      .text(`${key}: ${value}`);
    })
  });
  }
  
  function buildCharts(sample) {
  
  // Build Bubble Chart using the sample data
  var url = `/samples/${sample}`;
  console.log(`Building charts for sample ${sample} from ${url}`)
  d3.json(url).then(function(data){
    console.log("Sample Details")
    console.log(data);
    var trace1 = [{ 
      x: data.otu_ids,
      y: data.sample_values,
      mode: 'markers',
      marker: {
        color: data.otu_ids,
        colorscale: "Rainbow",
        size: data.sample_values
      },
      "hovertext": data.otu_labels
    }];
    var layout1 = {
    title: `Biodiversity Sample ${sample}`,
    xaxis: { title: "OTU IDs" },
    yaxis: { title: "Sample Values" }
    };
    Plotly.newPlot('bubble', trace1, layout1);
  });
  
    // Build Pie Chart using the top 10 sample_values
    d3.json(url).then(function(data){
      // define dictionaries & arrays to select top 10
      var dKeys = Object.keys(data);
      var idDict = {};
      var labelDict = {};
      var idList = data[dKeys[0]];
      var labelList = data[dKeys[1]];
      var valuesList = data[dKeys[2]];
      for (i = 0; i < valuesList.length; i++) {
        idDict[valuesList[i]] = idList[i];
        labelDict[valuesList[i]] = labelList[i];
      }
      // build id and values lists for top 10 
      var dKeys = Object.keys(idDict);
      var dLen = dKeys.length;
      var ids = [];
      var labels = [];
      var topTen = [];
      for (i = dLen; i > (dLen-11) ; i--) {
        topTen.push(dKeys[i]);
        ids.push(idDict[dKeys[i]]);
        labels.push(labelDict[dKeys[i]]);
      }
      //console.log("values, ids, and labels");
      //console.log(topTen);
      //console.log(ids);
      //console.log(labels);
      var trace2 = [{
          values: topTen,
          labels: ids,
          "hovertext": labels,
          type: 'pie'
        }];
        var layout2 = {
        title: "Top 10 Samples"
        };
        Plotly.newPlot('pie', trace2, layout2);
    }).catch((error) => {
      console.log("Error: " + error);
    });                                                      
  }
  
  function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");
  
  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
  
    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
  }
  
  function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
  }
  
  // Initialize the dashboard
  init();