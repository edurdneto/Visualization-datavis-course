mySettings = {

                                    // view port width and height 
                                    width:200,
                                    height:200,

                                    // chart position x,y, width and height
                                    chart:{
                                        type:'StackedAreaChart',
                                        colorRange:d3.scale.category10(),
                                        scale:d3.scale,
                                        spacer:5,
                                        column:2,
                                        wallColor:"rgba(230,230,230,0)",
                                        label:true,
                                    },
                                }
                                var barChart = $("#myDemo").vs(mySettings).data('visualSedimentation');