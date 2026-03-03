def get_mon_dict(data: dict[str]) -> dict[str]:
    """
    Getting a dictionary of all the pokemon in a save file with Personality values as keys
    """
    mon_dict = {mon['personality']:mon for mon in data['party']}
    for box in (data['pc'].keys()):
        if len(data['pc'][box]) > 0:
            for mon in data['pc'][box]:
                mon_dict[mon['personality']] = mon
    return mon_dict

def update_user_set_mon_data(old_dict: dict[str], new_dict: dict[str]) -> dict[str]:
    """
    Keeping consistency between old and new data with regards to 'badges' and 'alive' data which is set by the user
    """
    for mon in old_dict.keys():
        if mon in new_dict.keys():
            new_dict[mon]['badges'] = old_dict[mon]['badges']
            new_dict[mon]['alive'] = old_dict[mon]['alive']
    return new_dict

def update_mon_data(new_data: dict[str], updated_mon_dict: dict[str]):
    """
    Searching for and updating each pokemon with new data
    """
    for i in updated_mon_dict.keys():
        done = False
        for j in range(len(new_data['party'])):
            if new_data['party'][j]['personality'] == i:
                new_data['party'][j] = updated_mon_dict[i]
                done = True
                break
        if done:
            break
        for box in range(len(new_data['pc'])):
            for j in range(len(new_data['pc'][box])):
                if new_data['pc'][box][j]['personality'] == i:
                    new_data['party'][box][j] = updated_mon_dict[i]
                    done = True
                    break
            if done:
                break
    return new_data