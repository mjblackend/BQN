function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

function CopyArray(SrcArray,DestArray)
{
    if (SrcArray)
    {
        SrcArray.forEach(function (hall) {
            DestArray.push(hall.ID);
        });
    }
}

  module.exports.guid = guid;
  module.exports.CopyArray = CopyArray;