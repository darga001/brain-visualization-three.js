import React , {useState} from 'react';
import Lobes_and_names from  './Lobes_and_names.jsx';

function Brain_Menu ({onMeshSelect}) {
    const [selectedLobe, setSelectedLobe] = useState (null);
    //basic dropdwon menu
    return (
        <div>
            <h3> Brain Parts </h3>
            {Object.keys(Lobes_and_names).map((lobeName) => (
                <div key = {lobeName}>
                    <button onClick = {() => setSelectedLobe(lobeName)} >
                         {lobeName}
                          </button>
                          
                </div> 
            ))}
        </div>
    );
}
export default Brain_Menu;



       