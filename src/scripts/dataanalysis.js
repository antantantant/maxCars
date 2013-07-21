function SampleSet(a,b){
    //a = number of sample, b = dimension of sample
    this.random(a,b);
    return true
};

SampleSet.prototype.random = function(a,b){
    this.model = [];
    for(var i = 0; i<a; i++){
        for(var j = 0; j<b; j++){
            this.model.push(Math.random());
        }
    }
};
